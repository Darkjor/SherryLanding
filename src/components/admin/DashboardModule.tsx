/**
 * Sherry Studio — Módulo del dashboard.
 *
 * KPIs del día/mes + próximas citas. Lee de Supabase cuando está configurado;
 * si no, muestra una pista de configuración (SETUP.md). Tipado contra
 * src/lib/types.ts. Estados de carga/vacío/error contemplados.
 */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Appointment, AppointmentStatus } from '../../lib/types';
import {
  StatCard,
  Table,
  EmptyState,
  LoadingState,
  type Column,
} from './ui';

interface UpcomingAppointment {
  id: string;
  clientName: string;
  serviceName: string;
  startAt: string;
  status: AppointmentStatus;
}

interface DashboardData {
  citasHoy: number;
  ingresosMes: number;
  clientasNuevas: number;
  proximas: UpcomingAppointment[];
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: DashboardData };

/** Inicio/fin del día local en ISO, para acotar consultas por start_at. */
function todayBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Inicio del mes local en ISO. */
function monthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

async function loadDashboard(): Promise<DashboardData> {
  const { start, end } = todayBounds();
  const mStart = monthStart();

  // Citas de hoy (conteo).
  const citasHoyQuery = supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .gte('start_at', start)
    .lt('start_at', end);

  // Ingresos del mes (suma de sales.total).
  const ventasQuery = supabase
    .from('sales')
    .select('total')
    .gte('created_at', mStart);

  // Clientas nuevas este mes (conteo).
  const clientesQuery = supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', mStart);

  // Próximas 5 citas a partir de ahora.
  const proximasQuery = supabase
    .from('appointments')
    .select('id, client_name, service_name, start_at, status')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(5);

  const [citasHoyRes, ventasRes, clientesRes, proximasRes] = await Promise.all([
    citasHoyQuery,
    ventasQuery,
    clientesQuery,
    proximasQuery,
  ]);

  const firstError =
    citasHoyRes.error ||
    ventasRes.error ||
    clientesRes.error ||
    proximasRes.error;
  if (firstError) {
    throw new Error(firstError.message);
  }

  const ventasRows = (ventasRes.data ?? []) as Array<{ total: number }>;
  const ingresosMes = ventasRows.reduce(
    (sum, row) => sum + (Number(row.total) || 0),
    0,
  );

  type ProximaRow = {
    id: string;
    client_name: Appointment['clientName'];
    service_name: Appointment['serviceName'];
    start_at: Appointment['startAt'];
    status: AppointmentStatus;
  };
  const proximas: UpcomingAppointment[] = (
    (proximasRes.data ?? []) as ProximaRow[]
  ).map((r) => ({
    id: r.id,
    clientName: r.client_name,
    serviceName: r.service_name,
    startAt: r.start_at,
    status: r.status,
  }));

  return {
    citasHoy: citasHoyRes.count ?? 0,
    ingresosMes,
    clientasNuevas: clientesRes.count ?? 0,
    proximas,
  };
}

export default function DashboardModule() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let active = true;

    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }

    loadDashboard()
      .then((data) => {
        if (active) setState({ kind: 'ready', data });
      })
      .catch((err: unknown) => {
        if (active) {
          const message =
            err instanceof Error ? err.message : 'Error desconocido.';
          setState({ kind: 'error', message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para ver las métricas del salón. Encontrarás los pasos en SETUP.md."
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudieron cargar los datos"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';
  const data = state.kind === 'ready' ? state.data : null;

  const columns: Column<UpcomingAppointment>[] = [
    {
      key: 'client',
      header: 'Clienta',
      cell: (r) => <span className="font-medium">{r.clientName || 'Sin nombre'}</span>,
    },
    {
      key: 'service',
      header: 'Servicio',
      cell: (r) => r.serviceName || '—',
      hideOnMobile: true,
    },
    {
      key: 'when',
      header: 'Cuándo',
      cell: (r) => formatWhen(r.startAt),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'right',
      cell: (r) => (
        <span className="font-sans text-xs tracking-wide text-gris">
          {STATUS_LABEL[r.status]}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <section
        aria-label="Indicadores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          label="Citas de hoy"
          value={data ? data.citasHoy : 0}
          loading={loading}
        />
        <StatCard
          label="Ingresos del mes"
          value={data ? formatCurrency(data.ingresosMes) : formatCurrency(0)}
          loading={loading}
        />
        <StatCard
          label="Clientas nuevas"
          sublabel="Este mes"
          value={data ? data.clientasNuevas : 0}
          loading={loading}
        />
      </section>

      <section aria-label="Próximas citas" className="space-y-3">
        <h2 className="font-serif text-lg text-burgundy">Próximas citas</h2>
        {loading ? (
          <LoadingState />
        ) : (
          <Table
            columns={columns}
            rows={data?.proximas ?? []}
            rowKey={(r) => r.id}
            emptyTitle="Sin citas próximas"
            emptyDescription="Las nuevas reservas aparecerán aquí en cuanto se agenden."
          />
        )}
      </section>
    </div>
  );
}
