/**
 * Sherry Studio — Repositorio tipado de STAFF (equipo / especialistas).
 *
 * Capa fina sobre la tabla `staff` de Supabase. Mapea snake_case (DB) a
 * camelCase (`Staff` en types.ts). Lectura usada por la agenda para asignar
 * especialistas a las citas; CRUD + reordenamiento usados por el módulo Equipo.
 * Protegido por `assertSupabase()`.
 */
import { assertSupabase } from '../supabase';
import type { Staff } from '../types';

interface StaffRow {
  id: string;
  name: string;
  role: string;
  active: boolean;
  sort_order: number;
}

/** Datos para crear o editar un miembro del equipo (sin id ni sortOrder). */
export interface StaffInput {
  name: string;
  role: string;
  active: boolean;
}

function rowToStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

/** Lista el staff activo, ordenado. */
export async function listStaff(): Promise<Staff[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('staff')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as StaffRow[]).map(rowToStaff);
}

export async function createStaff(input: StaffInput): Promise<Staff> {
  const db = assertSupabase();
  // Coloca el nuevo miembro al final: sort_order = max + 1.
  const { data: maxRows, error: maxError } = await db
    .from('staff')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (maxError) throw new Error(maxError.message);
  const nextOrder =
    ((maxRows ?? [])[0]?.sort_order as number | undefined) != null
      ? (maxRows![0]!.sort_order as number) + 1
      : 0;

  const row: Omit<StaffRow, 'id'> = {
    name: input.name.trim(),
    role: input.role.trim(),
    active: input.active,
    sort_order: nextOrder,
  };
  const { data, error } = await db
    .from('staff')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToStaff(data as StaffRow);
}

export async function updateStaff(
  id: string,
  patch: Partial<StaffInput>,
): Promise<Staff> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<StaffRow, 'id'>> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.role !== undefined) dbPatch.role = patch.role.trim();
  if (patch.active !== undefined) dbPatch.active = patch.active;

  const { data, error } = await db
    .from('staff')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToStaff(data as StaffRow);
}

export async function deleteStaff(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('staff').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Reasigna sort_order según el orden de los ids recibidos (0..n-1). */
export async function reorderStaff(idsInOrder: string[]): Promise<void> {
  const db = assertSupabase();
  const updates = idsInOrder.map((id, index) =>
    db.from('staff').update({ sort_order: index }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
