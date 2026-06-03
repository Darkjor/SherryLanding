/**
 * Sherry Studio — Módulo de REPORTES de negocio.
 *
 * KPIs del periodo, ingresos por día/mes (gráfico de barras CSS sin librería),
 * servicios más vendidos y ocupación por especialista. Lee de reports.ts; toda
 * consulta está protegida por isSupabaseConfigured. Estados de carga/vacío/no
 * configurado contemplados. UI sobria (sin degradados ni librerías de chart).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import {
  occupancyByStaff,
  revenueByPeriod,
  topServices,
  type Granularity,
  type RevenuePoint,
  type StaffOccupancy,
  type TopService,
} from '../../../lib/db/reports';
import { listSales } from '../../../lib/db/sales';
import {
  Button,
  Field,
  SelectField,
  StatCard,
  Table,
  EmptyState,
  LoadingState,
  type Column,
} from '../ui';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: ReportData };

interface ReportData {
  ingresos: number;
  numVentas: number;
  ticketPromedio: number;
  propinas: number;
  revenue: RevenuePoint[];
  services: TopService[];
  occupancy: StaffOccupancy[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthStartInput(): string {
  const now = new Date();
  return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
}

function todayInput(): string {
  return toDateInput(new Date());
}

/** Convierte inputs date (YYYY-MM-DD) a límites ISO [inicio, finExclusivo]. */
function rangeFromInputs(from: string, to: string): { from: string; to: string } {
  const start = new Date(`${from}T00:00:00`);
  const endExclusive = new Date(`${to}T00:00:00`);
  endExclusive.setDate(endExclusive.getDate() + 1);
  return { from: start.toISOString(), to: endExclusive.toISOString() };
}

/** Etiqueta legible para un periodo 'YYYY-MM-DD' o 'YYYY-MM'. */
function periodLabel(period: string, granularity: Granularity): string {
  if (granularity === 'month') {
    const [y, m] = period.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      year: '2-digit',
    }).format(d);
  }
  const [y, m, day] = period.split('-');
  const d = new Date(Number(y), Number(m) - 1, Number(day));
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export default function ReportesModule() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [from, setFrom] = useState<string>(monthStartInput());
  const [to, setTo] = useState<string>(todayInput());
  const [granularity, setGranularity] = useState<Granularity>('day');

  const load = useCallback(async (): Promise<ReportData> => {
    const range = rangeFromInputs(from, to);
    const [sales, revenue, services, occupancy] = await Promise.all([
      listSales(range),
      revenueByPeriod({ ...range, granularity }),
      topServices(range),
      occupancyByStaff(range),
    ]);
    const ingresos = sales.reduce((sum, s) => sum + s.total, 0);
    const propinas = sales.reduce((sum, s) => sum + s.tip, 0);
    const numVentas = sales.length;
    return {
      ingresos,
      numVentas,
      ticketPromedio: numVentas > 0 ? ingresos / numVentas : 0,
      propinas,
      revenue,
      services,
      occupancy,
    };
  }, [from, to, granularity]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    let active = true;
    setState({ kind: 'loading' });
    load()
      .then((data) => {
        if (active) setState({ kind: 'ready', data });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Error desconocido.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [load]);

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para ver los reportes. Encontrarás los pasos en SETUP.md."
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudieron cargar los reportes"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
        action={
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        }
      />
    );
  }

  const loading = state.kind === 'loading';
  const data = state.kind === 'ready' ? state.data : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end gap-3">
        <Field
          label="Desde"
          type="date"
          value={from}
          max={to}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Field
          label="Hasta"
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
        <SelectField
          label="Agrupar por"
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as Granularity)}
        >
          <option value="day">Día</option>
          <option value="month">Mes</option>
        </SelectField>
      </header>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Ingresos del periodo"
          value={formatCurrency(data?.ingresos ?? 0)}
          loading={loading}
        />
        <StatCard
          label="Número de ventas"
          value={data?.numVentas ?? 0}
          loading={loading}
        />
        <StatCard
          label="Ticket promedio"
          value={formatCurrency(data?.ticketPromedio ?? 0)}
          loading={loading}
        />
        <StatCard
          label="Propinas totales"
          value={formatCurrency(data?.propinas ?? 0)}
          loading={loading}
        />
      </section>

      <section aria-label="Ingresos por periodo" className="space-y-3">
        <h2 className="font-serif text-lg text-burgundy">Ingresos por periodo</h2>
        {loading ? (
          <LoadingState />
        ) : (
          <RevenueBars points={data?.revenue ?? []} granularity={granularity} />
        )}
      </section>

      <section aria-label="Servicios más vendidos" className="space-y-3">
        <h2 className="font-serif text-lg text-burgundy">
          Servicios más vendidos
        </h2>
        <Table
          columns={serviceColumns}
          rows={data?.services ?? []}
          rowKey={(r) => r.description}
          loading={loading}
          emptyTitle="Sin ventas en el periodo"
          emptyDescription="Registra ventas para ver el ranking de servicios."
        />
      </section>

      <section aria-label="Ocupación por especialista" className="space-y-3">
        <h2 className="font-serif text-lg text-burgundy">
          Ocupación por especialista
        </h2>
        <Table
          columns={occupancyColumns}
          rows={data?.occupancy ?? []}
          rowKey={(r) => r.staffId ?? 'unassigned'}
          loading={loading}
          emptyTitle="Sin citas completadas"
          emptyDescription="Las citas marcadas como completadas aparecerán aquí."
        />
      </section>
    </div>
  );
}

const serviceColumns: Column<TopService>[] = [
  {
    key: 'description',
    header: 'Servicio o producto',
    cell: (r) => <span className="font-medium">{r.description}</span>,
  },
  {
    key: 'count',
    header: 'Unidades',
    align: 'center',
    cell: (r) => r.count,
  },
  {
    key: 'revenue',
    header: 'Ingresos',
    align: 'right',
    cell: (r) => formatCurrency(r.revenue),
  },
];

const occupancyColumns: Column<StaffOccupancy>[] = [
  {
    key: 'staff',
    header: 'Especialista',
    cell: (r) => <span className="font-medium">{r.staffName}</span>,
  },
  {
    key: 'completed',
    header: 'Citas completadas',
    align: 'right',
    cell: (r) => r.completed,
  },
];

// ---------------------------------------------------------------------------
// Gráfico de barras (CSS/flex, sin librería)
// ---------------------------------------------------------------------------

function RevenueBars({
  points,
  granularity,
}: {
  points: RevenuePoint[];
  granularity: Granularity;
}) {
  const max = useMemo(
    () => points.reduce((m, p) => Math.max(m, p.total), 0),
    [points],
  );

  if (points.length === 0) {
    return (
      <EmptyState
        title="Sin ingresos en el periodo"
        description="Ajusta el rango de fechas o registra nuevas ventas."
      />
    );
  }

  return (
    <div className="rounded-xl border border-bone-dark bg-bone-light p-5">
      <ul
        className="flex items-end gap-2 overflow-x-auto"
        style={{ minHeight: '12rem' }}
      >
        {points.map((p) => {
          const pct = max > 0 ? Math.max(4, (p.total / max) * 100) : 0;
          const label = periodLabel(p.period, granularity);
          return (
            <li
              key={p.period}
              className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-2"
            >
              <span className="font-sans text-xs text-gris">
                {formatCurrency(p.total)}
              </span>
              <div
                className="flex w-full items-end"
                style={{ height: '9rem' }}
                role="img"
                aria-label={`${label}: ${formatCurrency(p.total)}`}
              >
                <div
                  className="w-full rounded-t bg-burgundy"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="font-sans text-xs tracking-wide text-burgundy-dark">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
