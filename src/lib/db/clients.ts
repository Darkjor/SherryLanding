/**
 * Sherry Studio — Repositorio tipado de CLIENTES (CRM).
 *
 * Capa fina sobre la tabla `clients` de Supabase. Mapea snake_case (DB) a
 * camelCase (`Client` en types.ts) y viceversa. Toda llamada está protegida:
 * si Supabase no está configurado, `assertSupabase()` lanza un error legible
 * que la UI captura y muestra (ver guardas `isSupabaseConfigured` en módulos).
 */
import { assertSupabase } from '../supabase';
import type {
  Appointment,
  AppointmentStatus,
  Client,
  MembershipTier,
} from '../types';

/** Fila de la tabla `clients` tal como la devuelve Supabase. */
interface ClientRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  membership_tier: MembershipTier;
  created_at: string;
}

/** Datos para crear o editar una clienta (sin id ni createdAt gestionados). */
export interface ClientInput {
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  membershipTier: MembershipTier;
}

/** Fila de `appointments` (subconjunto necesario para el historial). */
interface AppointmentRow {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  service_id: string | null;
  service_name: string;
  staff_id: string | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string | null;
  source: 'online' | 'admin';
  created_at: string;
}

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    membershipTier: row.membership_tier,
    createdAt: row.created_at,
  };
}

function rowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceId: row.service_id,
    serviceName: row.service_name,
    staffId: row.staff_id,
    startAt: row.start_at,
    endAt: row.end_at,
    status: row.status,
    notes: row.notes,
    source: row.source,
    createdAt: row.created_at,
  };
}

function inputToRow(input: ClientInput): Omit<ClientRow, 'id' | 'created_at'> {
  const email = input.email?.trim() ?? '';
  const notes = input.notes?.trim() ?? '';
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: email.length > 0 ? email : null,
    notes: notes.length > 0 ? notes : null,
    membership_tier: input.membershipTier,
  };
}

export async function listClients(): Promise<Client[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ClientRow[]).map(rowToClient);
}

export async function getClient(id: string): Promise<Client> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return rowToClient(data as ClientRow);
}

export async function createClient(input: ClientInput): Promise<Client> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('clients')
    .insert(inputToRow(input))
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToClient(data as ClientRow);
}

export async function updateClient(
  id: string,
  patch: Partial<ClientInput>,
): Promise<Client> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<ClientRow, 'id' | 'created_at'>> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.phone !== undefined) dbPatch.phone = patch.phone.trim();
  if (patch.email !== undefined) {
    const email = patch.email?.trim() ?? '';
    dbPatch.email = email.length > 0 ? email : null;
  }
  if (patch.notes !== undefined) {
    const notes = patch.notes?.trim() ?? '';
    dbPatch.notes = notes.length > 0 ? notes : null;
  }
  if (patch.membershipTier !== undefined)
    dbPatch.membership_tier = patch.membershipTier;

  const { data, error } = await db
    .from('clients')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToClient(data as ClientRow);
}

export async function deleteClient(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Historial de citas de una clienta, más reciente primero. */
export async function getClientAppointments(
  clientId: string,
): Promise<Appointment[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .eq('client_id', clientId)
    .order('start_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AppointmentRow[]).map(rowToAppointment);
}
