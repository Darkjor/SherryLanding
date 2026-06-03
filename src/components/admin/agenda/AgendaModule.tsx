/**
 * Sherry Studio — Modulo de AGENDA (calendario de citas, estilo Fresha).
 *
 * Vista Dia / Semana con rejilla horaria (8:00-20:00), navegacion prev/hoy/sig,
 * citas pintadas como bloques posicionados por hora y coloreados por estado.
 * Clic en una cita abre un drawer con detalle + acciones (confirmar / completar
 * / cancelar / editar). "Nueva cita" crea una cita admin. Realtime via canal de
 * Supabase refresca en vivo. Estados de carga / vacio / no configurado.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';
import type { Appointment, AppointmentStatus, Service, Staff } from '../../../lib/types';
import {
  createAppointment,
  computeEndAt,
  deleteAppointment,
  listAppointments,
  updateAppointment,
  updateStatus,
  type AppointmentInput,
} from '../../../lib/db/appointments';
import { listServices } from '../../../lib/db/services';
import { listStaff } from '../../../lib/db/staff';
import {
  addDays,
  dateAndTimeToIso,
  formatDateLong,
  formatDateTime,
  formatTime,
  isoToLocalInput,
  localInputToIso,
  startOfDay,
  startOfWeek,
} from '../../../lib/datetime';
import {
  Button,
  Field,
  SelectField,
  TextareaField,
  EmptyState,
  LoadingState,
  ConfirmInline,
  useToast,
} from '../ui';
import Drawer from './Drawer';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const HOUR_PX = 64; // alto en px de cada hora en la rejilla

type View = 'day' | 'week';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

/** Clases de color del bloque por estado (sin gradientes, registro sobrio). */
const STATUS_BLOCK: Record<AppointmentStatus, string> = {
  pending: 'border-gold bg-gold/15 text-burgundy-dark',
  confirmed: 'border-burgundy bg-burgundy/10 text-burgundy-dark',
  completed: 'border-gris-light bg-gris-light/20 text-gris',
  cancelled: 'border-burgundy/30 bg-bone-light text-gris-light line-through',
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  pending: 'bg-gold/20 text-burgundy-dark',
  confirmed: 'bg-burgundy/10 text-burgundy',
  completed: 'bg-gris-light/30 text-gris',
  cancelled: 'bg-burgundy/5 text-gris-light',
};

const HOURS: number[] = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i,
);

interface FormState {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  staffId: string;
  startLocal: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  clientName: '',
  clientPhone: '',
  serviceId: '',
  staffId: '',
  startLocal: '',
  notes: '',
};

interface FormErrors {
  clientName?: string;
  clientPhone?: string;
  serviceId?: string;
  startLocal?: string;
}

/** Calcula offset (px desde el tope de la rejilla) y alto de un bloque. */
function blockGeometry(appt: Appointment): { top: number; height: number } | null {
  const start = new Date(appt.startAt);
  const end = new Date(appt.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const gridStart = DAY_START_HOUR * 60;
  const top = ((startMinutes - gridStart) / 60) * HOUR_PX;
  const rawHeight = ((Math.max(endMinutes, startMinutes + 15) - startMinutes) / 60) * HOUR_PX;
  return { top: Math.max(top, 0), height: Math.max(rawHeight, 22) };
}

/** Filtra y agrupa las citas que caen en un dia local concreto. */
function apptsForDay(appts: Appointment[], day: Date): Appointment[] {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  return appts.filter((a) => {
    const t = new Date(a.startAt).getTime();
    return t >= dayStart && t < dayEnd;
  });
}

export default function AgendaModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [view, setView] = useState<View>('day');
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));

  // Drawer de detalle / edicion / creacion.
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Rango visible (ISO) segun vista + ancla.
  const range = useMemo(() => {
    if (view === 'day') {
      const from = startOfDay(anchor);
      return { from: from.toISOString(), to: addDays(from, 1).toISOString(), days: [from] };
    }
    const from = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
    return { from: from.toISOString(), to: addDays(from, 7).toISOString(), days };
  }, [view, anchor]);

  const reload = useCallback(async () => {
    try {
      const rows = await listAppointments({ from: range.from, to: range.to });
      setAppts(rows);
      setState({ kind: 'ready' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      setState({ kind: 'error', message });
    }
  }, [range.from, range.to]);

  // Carga inicial de catalogos (servicios + staff).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    let active = true;
    Promise.all([listServices(), listStaff()])
      .then(([svc, stf]) => {
        if (!active) return;
        setServices(svc);
        setStaff(stf);
      })
      .catch(() => {
        /* Los catalogos son auxiliares; si fallan, los pickers quedan vacios. */
      });
    return () => {
      active = false;
    };
  }, []);

  // Recarga de citas cuando cambia el rango visible.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    setState((s) => (s.kind === 'ready' ? s : { kind: 'loading' }));
    void reload();
  }, [reload]);

  // Realtime: refresca al detectar cambios en la tabla appointments.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('agenda-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          void reloadRef.current();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const serviceById = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  function gotoToday() {
    setAnchor(startOfDay(new Date()));
  }
  function gotoPrev() {
    setAnchor((a) => addDays(a, view === 'day' ? -1 : -7));
  }
  function gotoNext() {
    setAnchor((a) => addDays(a, view === 'day' ? 1 : 7));
  }

  function openCreate() {
    setCreating(true);
    setEditing(false);
    setSelected(null);
    const base = new Date(startOfDay(anchor));
    base.setHours(10, 0, 0, 0);
    setForm({ ...EMPTY_FORM, startLocal: isoToLocalInput(base.toISOString()) });
    setErrors({});
  }

  function openDetail(appt: Appointment) {
    setSelected(appt);
    setCreating(false);
    setEditing(false);
  }

  function openEdit(appt: Appointment) {
    setSelected(appt);
    setCreating(false);
    setEditing(true);
    setForm({
      clientName: appt.clientName,
      clientPhone: appt.clientPhone,
      serviceId: appt.serviceId ?? '',
      staffId: appt.staffId ?? '',
      startLocal: isoToLocalInput(appt.startAt),
      notes: appt.notes ?? '',
    });
    setErrors({});
  }

  function closeDrawer() {
    if (saving) return;
    setSelected(null);
    setCreating(false);
    setEditing(false);
  }

  function validate(f: FormState): FormErrors {
    const e: FormErrors = {};
    if (!f.clientName.trim()) e.clientName = 'El nombre es obligatorio.';
    if (!f.clientPhone.trim()) e.clientPhone = 'El telefono es obligatorio.';
    if (!f.serviceId) e.serviceId = 'Selecciona un servicio.';
    if (!f.startLocal) {
      e.startLocal = 'Indica fecha y hora.';
    } else if (Number.isNaN(new Date(f.startLocal).getTime())) {
      e.startLocal = 'Fecha y hora invalidas.';
    }
    return e;
  }

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const svc = serviceById.get(form.serviceId);
    if (!svc) {
      setErrors((e) => ({ ...e, serviceId: 'Servicio no encontrado.' }));
      return;
    }
    const startAt = localInputToIso(form.startLocal);
    const endAt = computeEndAt(startAt, svc.durationMin);
    const payload: AppointmentInput = {
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      serviceId: svc.id,
      serviceName: svc.name,
      staffId: form.staffId || null,
      startAt,
      endAt,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (creating) {
        const created = await createAppointment(payload);
        setAppts((prev) => [...prev, created]);
        toast.success('Cita creada.');
      } else if (selected) {
        const updated = await updateAppointment(selected.id, payload);
        setAppts((prev) => prev.map((a) => (a.id === selected.id ? updated : a)));
        toast.success('Cita actualizada.');
      }
      closeDrawerForce();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function closeDrawerForce() {
    setSelected(null);
    setCreating(false);
    setEditing(false);
  }

  async function changeStatus(appt: Appointment, status: AppointmentStatus) {
    const prev = appts;
    setAppts((list) => list.map((a) => (a.id === appt.id ? { ...a, status } : a)));
    setSelected((s) => (s && s.id === appt.id ? { ...s, status } : s));
    try {
      await updateStatus(appt.id, status);
      toast.success(`Cita ${STATUS_LABEL[status].toLowerCase()}.`);
    } catch (err: unknown) {
      setAppts(prev);
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      toast.error(message);
    }
  }

  async function handleDelete(appt: Appointment) {
    const prev = appts;
    setAppts((list) => list.filter((a) => a.id !== appt.id));
    closeDrawerForce();
    try {
      await deleteAppointment(appt.id);
      toast.success('Cita eliminada.');
    } catch (err: unknown) {
      setAppts(prev);
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para gestionar la agenda de citas. Encontraras los pasos en SETUP.md."
        action={
          <a
            href={SETUP_HREF}
            className="font-sans text-sm font-semibold text-burgundy underline underline-offset-4 hover:text-burgundy-light"
          >
            Ver SETUP.md
          </a>
        }
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudo cargar la agenda"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';
  const todayStart = startOfDay(new Date()).getTime();

  const periodLabel =
    view === 'day'
      ? formatDateLong(range.days[0]!)
      : `${range.days[0]!.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${range.days[6]!.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;

  const drawerOpen = creating || selected !== null;
  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-burgundy">Agenda</h1>
          <p className="mt-1 font-sans text-sm text-gris capitalize">{periodLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-gris-light">
            <button
              type="button"
              onClick={() => setView('day')}
              className={`px-3 py-1.5 font-sans text-xs font-semibold tracking-wide ${
                view === 'day' ? 'bg-burgundy text-bone' : 'bg-transparent text-burgundy hover:bg-burgundy/5'
              }`}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => setView('week')}
              className={`px-3 py-1.5 font-sans text-xs font-semibold tracking-wide ${
                view === 'week' ? 'bg-burgundy text-bone' : 'bg-transparent text-burgundy hover:bg-burgundy/5'
              }`}
            >
              Semana
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={gotoPrev} aria-label="Anterior">
            ←
          </Button>
          <Button variant="secondary" size="sm" onClick={gotoToday}>
            Hoy
          </Button>
          <Button variant="ghost" size="sm" onClick={gotoNext} aria-label="Siguiente">
            →
          </Button>
          <Button variant="primary" onClick={openCreate}>
            Nueva cita
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <CalendarGrid
          days={range.days}
          appts={appts}
          isWeek={view === 'week'}
          todayStart={todayStart}
          onSelect={openDetail}
        />
      )}

      <Drawer
        open={drawerOpen}
        title={creating ? 'Nueva cita' : editing ? 'Editar cita' : 'Detalle de la cita'}
        onClose={closeDrawer}
        footer={
          showForm ? (
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
                Guardar
              </Button>
            </div>
          ) : undefined
        }
      >
        {showForm ? (
          <div className="space-y-4">
            <Field
              label="Cliente"
              required
              value={form.clientName}
              error={errors.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
            />
            <Field
              label="Telefono / WhatsApp"
              required
              type="tel"
              value={form.clientPhone}
              error={errors.clientPhone}
              onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
            />
            <SelectField
              label="Servicio"
              required
              value={form.serviceId}
              error={errors.serviceId}
              onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
            >
              <option value="">Selecciona un servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMin} min)
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Especialista"
              value={form.staffId}
              onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}
            >
              <option value="">Sin asignar</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.role}
                </option>
              ))}
            </SelectField>
            <Field
              label="Fecha y hora"
              required
              type="datetime-local"
              value={form.startLocal}
              error={errors.startLocal}
              onChange={(e) => setForm((f) => ({ ...f, startLocal: e.target.value }))}
            />
            <TextareaField
              label="Notas"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        ) : selected ? (
          <AppointmentDetail
            appt={selected}
            onEdit={() => openEdit(selected)}
            onStatus={(st) => void changeStatus(selected, st)}
            onDelete={() => void handleDelete(selected)}
          />
        ) : null}
      </Drawer>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface CalendarGridProps {
  days: Date[];
  appts: Appointment[];
  isWeek: boolean;
  todayStart: number;
  onSelect: (appt: Appointment) => void;
}

function CalendarGrid({ days, appts, isWeek, todayStart, onSelect }: CalendarGridProps) {
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX + HOUR_PX;
  return (
    <div className="overflow-x-auto rounded-xl border border-bone-dark bg-bone-light">
      <div className="flex min-w-[640px]">
        {/* Columna de horas */}
        <div className="w-14 shrink-0 border-r border-bone-dark">
          <div className="h-10 border-b border-bone-dark" />
          <div className="relative" style={{ height: gridHeight }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 font-sans text-xs text-gris-light"
                style={{ top: i * HOUR_PX }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Columnas de dias */}
        <div className="flex flex-1">
          {days.map((day) => {
            const dayAppts = apptsForDay(appts, day);
            const isToday = startOfDay(day).getTime() === todayStart;
            return (
              <div key={day.toISOString()} className="flex-1 border-r border-bone-dark last:border-r-0">
                <div
                  className={`flex h-10 flex-col items-center justify-center border-b border-bone-dark font-sans ${
                    isToday ? 'bg-burgundy/5' : ''
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide text-gris-light">
                    {day.toLocaleDateString('es-MX', { weekday: 'short' })}
                  </span>
                  <span
                    className={`text-xs font-semibold ${isToday ? 'text-burgundy' : 'text-gris'}`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="relative" style={{ height: gridHeight }}>
                  {/* Lineas de hora */}
                  {HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-bone-dark/50"
                      style={{ top: i * HOUR_PX }}
                    />
                  ))}
                  {/* Bloques de cita */}
                  {dayAppts.map((appt) => {
                    const geo = blockGeometry(appt);
                    if (!geo) return null;
                    return (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={() => onSelect(appt)}
                        title={`${appt.clientName} · ${appt.serviceName}`}
                        className={`absolute left-1 right-1 overflow-hidden rounded-md border-l-2 px-2 py-1 text-left transition-colors hover:brightness-95 ${STATUS_BLOCK[appt.status]}`}
                        style={{ top: geo.top, height: geo.height }}
                      >
                        <span className="block truncate font-sans text-[11px] font-semibold">
                          {formatTime(appt.startAt)} {appt.clientName}
                        </span>
                        {!isWeek && (
                          <span className="block truncate font-sans text-[11px] opacity-80">
                            {appt.serviceName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface AppointmentDetailProps {
  appt: Appointment;
  onEdit: () => void;
  onStatus: (status: AppointmentStatus) => void;
  onDelete: () => void;
}

function AppointmentDetail({ appt, onEdit, onStatus, onDelete }: AppointmentDetailProps) {
  const waDigits = appt.clientPhone.replace(/\D/g, '');
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 font-sans text-xs font-semibold ${STATUS_BADGE[appt.status]}`}
        >
          {STATUS_LABEL[appt.status]}
        </span>
        <span className="font-sans text-xs uppercase tracking-wide text-gris-light">
          {appt.source === 'online' ? 'Reserva online' : 'Cita interna'}
        </span>
      </div>

      <dl className="space-y-3 font-sans text-sm">
        <Detail label="Cliente" value={appt.clientName} />
        <Detail
          label="Telefono"
          value={
            waDigits ? (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy underline underline-offset-2 hover:text-burgundy-light"
              >
                {appt.clientPhone}
              </a>
            ) : (
              appt.clientPhone
            )
          }
        />
        <Detail label="Servicio" value={appt.serviceName} />
        <Detail label="Inicio" value={formatDateTime(appt.startAt)} />
        <Detail label="Fin" value={formatDateTime(appt.endAt)} />
        {appt.notes && <Detail label="Notas" value={appt.notes} />}
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-bone-dark pt-4">
        {appt.status !== 'confirmed' && appt.status !== 'completed' && (
          <Button variant="primary" size="sm" onClick={() => onStatus('confirmed')}>
            Confirmar
          </Button>
        )}
        {appt.status !== 'completed' && (
          <Button variant="gold" size="sm" onClick={() => onStatus('completed')}>
            Completar
          </Button>
        )}
        {appt.status !== 'cancelled' && (
          <Button variant="danger" size="sm" onClick={() => onStatus('cancelled')}>
            Cancelar
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <ConfirmInline
          question="Eliminar esta cita?"
          confirmLabel="Eliminar"
          onConfirm={onDelete}
          trigger={(ask) => (
            <Button variant="danger" size="sm" onClick={ask}>
              Eliminar
            </Button>
          )}
        />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-gris-light">
        {label}
      </dt>
      <dd className="flex-1 text-burgundy-dark">{value}</dd>
    </div>
  );
}
