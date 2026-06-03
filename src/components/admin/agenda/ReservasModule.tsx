/**
 * Sherry Studio — Modulo de RESERVAS (bandeja de solicitudes online).
 *
 * Inbox enfocado en las citas de origen 'online' (las que llegan del formulario
 * publico de la landing), priorizando 'pending' para que el equipo las atienda.
 * Tabla con cliente, telefono (boton WhatsApp), servicio, fecha solicitada y
 * estado. Acciones: confirmar / cancelar. Realtime para que las nuevas reservas
 * aparezcan en vivo. Reusa primitivas de ui.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';
import type { Appointment, AppointmentStatus } from '../../../lib/types';
import { listOnlineAppointments, updateStatus } from '../../../lib/db/appointments';
import { formatDateTime } from '../../../lib/datetime';
import {
  Button,
  Table,
  EmptyState,
  useToast,
  type Column,
} from '../ui';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

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

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  pending: 'bg-gold/20 text-burgundy-dark',
  confirmed: 'bg-burgundy/10 text-burgundy',
  completed: 'bg-gris-light/30 text-gris',
  cancelled: 'bg-burgundy/5 text-gris-light',
};

type Filter = 'pending' | 'all';

export default function ReservasModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [rows, setRows] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');

  const reload = useCallback(async () => {
    try {
      const data = await listOnlineAppointments();
      setRows(data);
      setState({ kind: 'ready' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      setState({ kind: 'error', message });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    void reload();
  }, [reload]);

  // Realtime: nuevas reservas online aparecen en vivo.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('reservas-online')
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

  async function changeStatus(appt: Appointment, status: AppointmentStatus) {
    const prev = rows;
    setRows((list) => list.map((a) => (a.id === appt.id ? { ...a, status } : a)));
    try {
      await updateStatus(appt.id, status);
      toast.success(`Reserva ${STATUS_LABEL[status].toLowerCase()}.`);
    } catch (err: unknown) {
      setRows(prev);
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      toast.error(message);
    }
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para recibir las reservas del sitio web. Encontraras los pasos en SETUP.md."
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
        title="No se pudieron cargar las reservas"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';
  const visible = filter === 'pending' ? rows.filter((r) => r.status === 'pending') : rows;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  const columns: Column<Appointment>[] = [
    {
      key: 'client',
      header: 'Cliente',
      cell: (row) => <span className="font-medium">{row.clientName}</span>,
    },
    {
      key: 'phone',
      header: 'WhatsApp',
      cell: (row) => {
        const digits = row.clientPhone.replace(/\D/g, '');
        if (!digits) return <span className="text-gris-light">{row.clientPhone}</span>;
        return (
          <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              {row.clientPhone}
            </Button>
          </a>
        );
      },
    },
    {
      key: 'service',
      header: 'Servicio',
      cell: (row) => row.serviceName,
    },
    {
      key: 'when',
      header: 'Fecha solicitada',
      hideOnMobile: true,
      cell: (row) => formatDateTime(row.startAt),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 font-sans text-xs font-semibold ${STATUS_BADGE[row.status]}`}
        >
          {STATUS_LABEL[row.status]}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {row.status !== 'confirmed' && row.status !== 'completed' && (
            <Button variant="primary" size="sm" onClick={() => void changeStatus(row, 'confirmed')}>
              Confirmar
            </Button>
          )}
          {row.status !== 'cancelled' && (
            <Button variant="danger" size="sm" onClick={() => void changeStatus(row, 'cancelled')}>
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-burgundy">Reservas</h1>
          <p className="mt-1 font-sans text-sm text-gris">
            Solicitudes que llegan desde el formulario del sitio web.
            {pendingCount > 0 && (
              <span className="ml-1 font-semibold text-burgundy">
                {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}.
              </span>
            )}
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-gris-light">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 font-sans text-xs font-semibold tracking-wide ${
              filter === 'pending' ? 'bg-burgundy text-bone' : 'bg-transparent text-burgundy hover:bg-burgundy/5'
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-sans text-xs font-semibold tracking-wide ${
              filter === 'all' ? 'bg-burgundy text-bone' : 'bg-transparent text-burgundy hover:bg-burgundy/5'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        rows={visible}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle={filter === 'pending' ? 'Sin solicitudes pendientes' : 'Sin reservas online'}
        emptyDescription={
          filter === 'pending'
            ? 'Cuando una clienta reserve desde el sitio, su solicitud aparecera aqui.'
            : 'Aun no hay reservas provenientes del sitio web.'
        }
      />
    </div>
  );
}
