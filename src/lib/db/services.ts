/**
 * Sherry Studio — Repositorio tipado de SERVICIOS (catálogo).
 *
 * Capa fina sobre la tabla `services` de Supabase. Mapea snake_case (DB) a
 * camelCase (`Service` en types.ts) y viceversa. Toda llamada está protegida:
 * si Supabase no está configurado, `assertSupabase()` lanza un error legible
 * que la UI captura y muestra (ver guardas `isSupabaseConfigured` en módulos).
 */
import { assertSupabase } from '../supabase';
import type { Service, ServiceCategory } from '../types';

/** Fila de la tabla `services` tal como la devuelve Supabase. */
interface ServiceRow {
  id: string;
  name: string;
  description: string;
  price_range: string;
  duration_min: number;
  frequency: string;
  category: ServiceCategory;
  sort_order: number;
}

/** Datos para crear o editar un servicio (sin id ni sortOrder gestionados). */
export interface ServiceInput {
  name: string;
  description: string;
  priceRange: string;
  durationMin: number;
  frequency: string;
  category: ServiceCategory;
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceRange: row.price_range,
    durationMin: row.duration_min,
    frequency: row.frequency,
    category: row.category,
    sortOrder: row.sort_order,
  };
}

function inputToRow(input: ServiceInput): Omit<ServiceRow, 'id' | 'sort_order'> {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price_range: input.priceRange.trim(),
    duration_min: input.durationMin,
    frequency: input.frequency.trim(),
    category: input.category,
  };
}

/** Genera un id legible (slug) a partir del nombre, con sufijo aleatorio. */
function slugId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `svc-${suffix}`;
}

export async function listServices(): Promise<Service[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ServiceRow[]).map(rowToService);
}

export async function createService(input: ServiceInput): Promise<Service> {
  const db = assertSupabase();
  // Coloca el nuevo servicio al final: sort_order = max + 1.
  const { data: maxRows, error: maxError } = await db
    .from('services')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (maxError) throw new Error(maxError.message);
  const nextOrder =
    ((maxRows ?? [])[0]?.sort_order as number | undefined) != null
      ? (maxRows![0]!.sort_order as number) + 1
      : 0;

  const row: ServiceRow = {
    id: slugId(input.name),
    sort_order: nextOrder,
    ...inputToRow(input),
  };
  const { data, error } = await db
    .from('services')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToService(data as ServiceRow);
}

export async function updateService(
  id: string,
  patch: Partial<ServiceInput>,
): Promise<Service> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<ServiceRow, 'id'>> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.description !== undefined)
    dbPatch.description = patch.description.trim();
  if (patch.priceRange !== undefined)
    dbPatch.price_range = patch.priceRange.trim();
  if (patch.durationMin !== undefined) dbPatch.duration_min = patch.durationMin;
  if (patch.frequency !== undefined) dbPatch.frequency = patch.frequency.trim();
  if (patch.category !== undefined) dbPatch.category = patch.category;

  const { data, error } = await db
    .from('services')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToService(data as ServiceRow);
}

export async function deleteService(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Reasigna sort_order según el orden de los ids recibidos (0..n-1). */
export async function reorderServices(idsInOrder: string[]): Promise<void> {
  const db = assertSupabase();
  const updates = idsInOrder.map((id, index) =>
    db.from('services').update({ sort_order: index }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
