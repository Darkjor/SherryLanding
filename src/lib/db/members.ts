/**
 * Sherry Studio — Repositorio tipado de MEMBRESÍAS.
 *
 * Cubre dos tablas:
 *  - `membership_plans`: planes vendibles (name, price, active).
 *  - `members`: membresías de clientas (clientId, planId, status, startedAt).
 *
 * Mapea snake_case (DB) a camelCase (types.ts). `listMembers()` enriquece cada
 * miembro con el nombre de la clienta y del plan mediante dos consultas y un
 * merge en memoria (evita depender de embeds de PostgREST). Protegido por
 * `assertSupabase()`.
 */
import { assertSupabase } from '../supabase';
import type { Member, MembershipPlan } from '../types';

// ---------------------------------------------------------------------------
// Planes (membership_plans)
// ---------------------------------------------------------------------------

interface PlanRow {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface PlanInput {
  name: string;
  price: number;
  active: boolean;
}

function rowToPlan(row: PlanRow): MembershipPlan {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    active: row.active,
  };
}

export async function listMembershipPlans(): Promise<MembershipPlan[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('membership_plans')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlanRow[]).map(rowToPlan);
}

export async function createPlan(input: PlanInput): Promise<MembershipPlan> {
  const db = assertSupabase();
  const row: Omit<PlanRow, 'id'> = {
    name: input.name.trim(),
    price: input.price,
    active: input.active,
  };
  const { data, error } = await db
    .from('membership_plans')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToPlan(data as PlanRow);
}

export async function updatePlan(
  id: string,
  patch: Partial<PlanInput>,
): Promise<MembershipPlan> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<PlanRow, 'id'>> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.price !== undefined) dbPatch.price = patch.price;
  if (patch.active !== undefined) dbPatch.active = patch.active;

  const { data, error } = await db
    .from('membership_plans')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToPlan(data as PlanRow);
}

export async function deletePlan(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('membership_plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Miembros (members)
// ---------------------------------------------------------------------------

type MemberStatus = Member['status'];

interface MemberRow {
  id: string;
  client_id: string;
  plan_id: string;
  status: MemberStatus;
  started_at: string;
}

/** Miembro enriquecido con los nombres de la clienta y del plan. */
export interface MemberWithNames extends Member {
  clientName: string;
  planName: string;
}

export interface MemberInput {
  clientId: string;
  planId: string;
  status: MemberStatus;
}

function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    clientId: row.client_id,
    planId: row.plan_id,
    status: row.status,
    startedAt: row.started_at,
  };
}

/**
 * Lista los miembros con nombre de clienta + nombre de plan. Hace tres
 * consultas (members, clients, plans) y las une en memoria.
 */
export async function listMembers(): Promise<MemberWithNames[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('members')
    .select('*')
    .order('started_at', { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MemberRow[];
  if (rows.length === 0) return [];

  const clientIds = [...new Set(rows.map((r) => r.client_id))];
  const planIds = [...new Set(rows.map((r) => r.plan_id))];

  const [clientsRes, plansRes] = await Promise.all([
    db.from('clients').select('id, name').in('id', clientIds),
    db.from('membership_plans').select('id, name').in('id', planIds),
  ]);
  if (clientsRes.error) throw new Error(clientsRes.error.message);
  if (plansRes.error) throw new Error(plansRes.error.message);

  const clientNames = new Map<string, string>(
    ((clientsRes.data ?? []) as { id: string; name: string }[]).map((c) => [
      c.id,
      c.name,
    ]),
  );
  const planNames = new Map<string, string>(
    ((plansRes.data ?? []) as { id: string; name: string }[]).map((p) => [
      p.id,
      p.name,
    ]),
  );

  return rows.map((row) => ({
    ...rowToMember(row),
    clientName: clientNames.get(row.client_id) ?? 'Clienta',
    planName: planNames.get(row.plan_id) ?? 'Plan',
  }));
}

export async function createMember(input: MemberInput): Promise<Member> {
  const db = assertSupabase();
  const row = {
    client_id: input.clientId,
    plan_id: input.planId,
    status: input.status,
  };
  const { data, error } = await db
    .from('members')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToMember(data as MemberRow);
}

export async function updateMemberStatus(
  id: string,
  status: MemberStatus,
): Promise<Member> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('members')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToMember(data as MemberRow);
}

export async function deleteMember(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('members').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
