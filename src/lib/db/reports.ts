/**
 * Sherry Studio — Helpers de REPORTES de negocio.
 *
 * Consultas de solo lectura que agregan datos en JS (sin vistas SQL): ingresos
 * por periodo, servicios más vendidos y ocupación por especialista. Cada helper
 * está protegido por `assertSupabase()` y acota por rango de fechas. Tipado
 * contra src/lib/types.ts. La agregación se hace tras traer las filas para
 * mantener la implementación simple y portable.
 */
import { assertSupabase } from '../supabase';

/** Rango de fechas (ISO) común a todos los reportes. */
export interface ReportRange {
  from: string;
  to: string;
}

export type Granularity = 'day' | 'month';

/** Un punto agregado de ingresos: clave de periodo + total. */
export interface RevenuePoint {
  /** Etiqueta del periodo: 'YYYY-MM-DD' (día) o 'YYYY-MM' (mes). */
  period: string;
  total: number;
}

export interface TopService {
  description: string;
  count: number;
  revenue: number;
}

export interface StaffOccupancy {
  staffId: string | null;
  staffName: string;
  completed: number;
}

/** Deriva la clave de periodo a partir de un ISO datetime. */
function periodKey(iso: string, granularity: Granularity): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  if (granularity === 'month') return `${y}-${m}`;
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Ingresos agregados por día o mes dentro del rango, ordenados
 * cronológicamente. Suma `total` de cada venta en su periodo.
 */
export async function revenueByPeriod(params: {
  from: string;
  to: string;
  granularity: Granularity;
}): Promise<RevenuePoint[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('sales')
    .select('total, created_at')
    .gte('created_at', params.from)
    .lt('created_at', params.to)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{ total: number; created_at: string }>;
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = periodKey(row.created_at, params.granularity);
    totals.set(key, (totals.get(key) ?? 0) + (Number(row.total) || 0));
  }

  return Array.from(totals.entries())
    .map(([period, total]) => ({ period, total }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Servicios/productos más vendidos en el rango, agregados desde `sale_items`
 * de las ventas del periodo. Ordenados por ingresos descendente.
 */
export async function topServices(range: ReportRange): Promise<TopService[]> {
  const db = assertSupabase();

  // 1) Ids de ventas dentro del rango.
  const { data: saleRows, error: salesError } = await db
    .from('sales')
    .select('id')
    .gte('created_at', range.from)
    .lt('created_at', range.to);
  if (salesError) throw new Error(salesError.message);
  const saleIds = ((saleRows ?? []) as Array<{ id: string }>).map((r) => r.id);
  if (saleIds.length === 0) return [];

  // 2) Líneas de esas ventas.
  const { data: itemRows, error: itemsError } = await db
    .from('sale_items')
    .select('description, quantity, unit_price')
    .in('sale_id', saleIds);
  if (itemsError) throw new Error(itemsError.message);

  const acc = new Map<string, TopService>();
  for (const row of (itemRows ?? []) as Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>) {
    const description = row.description;
    const qty = Number(row.quantity) || 0;
    const revenue = qty * (Number(row.unit_price) || 0);
    const existing = acc.get(description);
    if (existing) {
      existing.count += qty;
      existing.revenue += revenue;
    } else {
      acc.set(description, { description, count: qty, revenue });
    }
  }

  return Array.from(acc.values()).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Ocupación por especialista: citas con estado 'completed' en el rango,
 * agrupadas por staff_id y enriquecidas con el nombre del especialista.
 */
export async function occupancyByStaff(
  range: ReportRange,
): Promise<StaffOccupancy[]> {
  const db = assertSupabase();

  const { data: apptRows, error: apptError } = await db
    .from('appointments')
    .select('staff_id')
    .eq('status', 'completed')
    .gte('start_at', range.from)
    .lt('start_at', range.to);
  if (apptError) throw new Error(apptError.message);

  const counts = new Map<string | null, number>();
  for (const row of (apptRows ?? []) as Array<{ staff_id: string | null }>) {
    const key = row.staff_id;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  // Nombres del staff (solo para los ids presentes y no nulos).
  const staffIds = Array.from(counts.keys()).filter(
    (id): id is string => id !== null,
  );
  const names = new Map<string, string>();
  if (staffIds.length > 0) {
    const { data: staffRows, error: staffError } = await db
      .from('staff')
      .select('id, name')
      .in('id', staffIds);
    if (staffError) throw new Error(staffError.message);
    for (const row of (staffRows ?? []) as Array<{ id: string; name: string }>) {
      names.set(row.id, row.name);
    }
  }

  return Array.from(counts.entries())
    .map(([staffId, completed]) => ({
      staffId,
      staffName: staffId ? names.get(staffId) ?? 'Especialista' : 'Sin asignar',
      completed,
    }))
    .sort((a, b) => b.completed - a.completed);
}
