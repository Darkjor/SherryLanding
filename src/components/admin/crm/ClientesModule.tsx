/**
 * Sherry Studio — Módulo de CLIENTES (CRM).
 *
 * Tabla buscable de clientas (nombre, teléfono con deep-link a WhatsApp, email,
 * membresía) + alta/edición en drawer lateral (no modal), borrado con
 * confirmación inline y panel de detalle con historial de citas (solo lectura).
 * Actualizaciones optimistas con feedback por toast. Estados de carga / vacío /
 * "Supabase no configurado". Tipado contra src/lib/types.ts.
 */
import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import type {
  Appointment,
  AppointmentStatus,
  Client,
  MembershipTier,
} from '../../../lib/types';
import {
  createClient,
  deleteClient,
  getClientAppointments,
  listClients,
  updateClient,
  type ClientInput,
} from '../../../lib/db/clients';
import {
  Button,
  Table,
  Field,
  TextareaField,
  SelectField,
  ConfirmInline,
  EmptyState,
  LoadingState,
  useToast,
  type Column,
} from '../ui';
import Drawer from './Drawer';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

const TIERS: { value: 'none' | NonNullable<MembershipTier>; label: string }[] = [
  { value: 'none', label: 'Sin membresía' },
  { value: 'RITUAL', label: 'RITUAL' },
  { value: 'MAISON', label: 'MAISON' },
  { value: 'SHERRY VIP', label: 'SHERRY VIP' },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

interface FormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
  tier: 'none' | NonNullable<MembershipTier>;
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  tier: 'none',
};

interface FormErrors {
  name?: string;
  phone?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio.';
  return errors;
}

function tierToTier(tier: FormState['tier']): MembershipTier {
  return tier === 'none' ? null : tier;
}

/** Solo dígitos para el deep-link de WhatsApp. */
function waDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ClientesModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Panel de detalle (historial de citas).
  const [detail, setDetail] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    listClients()
      .then((rows) => {
        if (!active) return;
        setClients(rows);
        setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : 'Error desconocido.';
        setState({ kind: 'error', message });
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    const digits = q.replace(/\D/g, '');
    return clients.filter((c) => {
      const byName = c.name.toLowerCase().includes(q);
      const byPhone =
        digits.length > 0 && waDigits(c.phone).includes(digits);
      return byName || byPhone;
    });
  }, [clients, query]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email ?? '',
      notes: client.notes ?? '',
      tier: client.membershipTier ?? 'none',
    });
    setErrors({});
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerOpen(false);
  }

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: ClientInput = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      membershipTier: tierToTier(form.tier),
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateClient(editingId, input);
        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
        toast.success('Clienta actualizada.');
      } else {
        const created = await createClient(input);
        setClients((prev) => [created, ...prev]);
        toast.success('Clienta creada.');
      }
      setDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    const prev = clients;
    setClients((list) => list.filter((c) => c.id !== client.id)); // optimista
    try {
      await deleteClient(client.id);
      toast.success('Clienta eliminada.');
    } catch (err: unknown) {
      setClients(prev); // revertir
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  function openDetail(client: Client) {
    setDetail(client);
    setAppointments([]);
    setLoadingHistory(true);
    getClientAppointments(client.id)
      .then((rows) => setAppointments(rows))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Error al cargar el historial.';
        toast.error(message);
      })
      .finally(() => setLoadingHistory(false));
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para gestionar las clientas. Encontrarás los pasos en SETUP.md."
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
        title="No se pudieron cargar las clientas"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Clienta',
      cell: (row) => (
        <button
          type="button"
          onClick={() => openDetail(row)}
          className="text-left font-medium text-burgundy underline-offset-4 hover:underline"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      cell: (row) => {
        const digits = waDigits(row.phone);
        if (!digits) return row.phone || '—';
        return (
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-burgundy underline-offset-4 hover:underline"
          >
            {row.phone}
          </a>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      cell: (row) => row.email ?? '—',
    },
    {
      key: 'tier',
      header: 'Membresía',
      hideOnMobile: true,
      cell: (row) => row.membershipTier ?? 'Sin membresía',
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <ConfirmInline
            question="¿Eliminar esta clienta?"
            confirmLabel="Eliminar"
            onConfirm={() => handleDelete(row)}
            trigger={(ask) => (
              <Button variant="danger" size="sm" onClick={ask}>
                Eliminar
              </Button>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-burgundy">Clientes</h1>
          <p className="mt-1 font-sans text-sm text-gris">
            Gestiona tu cartera de clientas y su historial.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Nueva clienta
        </Button>
      </div>

      <div className="max-w-sm">
        <Field
          label="Buscar"
          placeholder="Nombre o teléfono"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle={query ? 'Sin coincidencias' : 'Sin clientas'}
        emptyDescription={
          query
            ? 'Ninguna clienta coincide con la búsqueda.'
            : 'Crea la primera clienta de tu cartera.'
        }
        emptyAction={
          !query ? (
            <Button variant="primary" onClick={openCreate}>
              Nueva clienta
            </Button>
          ) : undefined
        }
      />

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Editar clienta' : 'Nueva clienta'}
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDrawer} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              loading={saving}
            >
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field
            label="Nombre"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Field
            label="Teléfono"
            required
            placeholder="+52 55 1234 5678"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextareaField
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <SelectField
            label="Membresía"
            value={form.tier}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tier: e.target.value as FormState['tier'],
              }))
            }
          >
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
        </div>
      </Drawer>

      <Drawer
        open={detail !== null}
        title={detail ? detail.name : 'Detalle'}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div className="space-y-5">
            <div className="space-y-1 font-sans text-sm text-burgundy-dark">
              <p>
                <span className="text-gris">Teléfono: </span>
                {detail.phone || '—'}
              </p>
              <p>
                <span className="text-gris">Email: </span>
                {detail.email ?? '—'}
              </p>
              <p>
                <span className="text-gris">Membresía: </span>
                {detail.membershipTier ?? 'Sin membresía'}
              </p>
              {detail.notes && (
                <p className="pt-1">
                  <span className="text-gris">Notas: </span>
                  {detail.notes}
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-3 font-sans text-xs font-semibold tracking-wide uppercase text-burgundy">
                Historial de citas
              </h3>
              {loadingHistory ? (
                <LoadingState />
              ) : appointments.length === 0 ? (
                <EmptyState
                  title="Sin citas"
                  description="Esta clienta aún no tiene citas registradas."
                />
              ) : (
                <ul className="space-y-2">
                  {appointments.map((apt) => (
                    <li
                      key={apt.id}
                      className="rounded-lg border border-bone-dark bg-bone-light px-4 py-3"
                    >
                      <p className="font-sans text-sm font-medium text-burgundy-dark">
                        {apt.serviceName}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-gris">
                        {formatDate(apt.startAt)} · {STATUS_LABEL[apt.status]}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
