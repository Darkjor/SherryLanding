/**
 * Sherry Studio — Repositorio tipado de CITAS (appointments).
 *
 * Capa fina sobre la tabla `appointments` de Supabase. Mapea snake_case (DB) a
 * camelCase (`Appointment` en types.ts) y viceversa.
 *
 * Dos caminos de acceso, distintos por seguridad (RLS):
 *  - Administración (authenticated): listAppointments / createAppointment /
 *    updateAppointment / updateStatus / deleteAppointment. Protegidos por
 *    `assertSupabase()`; la UI los envuelve además en `isSupabaseConfigured`.
 *  - Público (anon): `createOnlineBooking` inserta una solicitud con
 *    status='pending' y source='online' (única operación que permite la policy
 *    `appointments_anon_insert`). NO exige login, pero sí que exista el cliente
 *    Supabase; si no está configurado falla con un mensaje amable.
 */
import { assertSupabase, isSupabaseConfigured, supabase } from '../supabase';
import type { Appointment, AppointmentStatus, Service } from '../types';
import { listServices } from './services';

/** Fila de la tabla `appointments` tal como la devuelve Supabase. */
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

/**
 * Calcula el ISO datetime de fin a partir del inicio y la duración en minutos.
 * Pura y testeable; no depende de Supabase. Devuelve ISO en UTC (toISOString).
 */
export function computeEndAt(startAt: string, durationMin: number): string {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error('startAt no es una fecha válida.');
  }
  const safeDuration = Number.isFinite(durationMin) && durationMin > 0 ? durationMin : 60;
  return new Date(start.getTime() + safeDuration * 60_000).toISOString();
}

/** Datos para crear una cita desde el admin (source='admin'). */
export interface AppointmentInput {
  clientName: string;
  clientPhone: string;
  serviceId: string | null;
  serviceName: string;
  staffId: string | null;
  startAt: string;
  /** ISO de fin; si se omite, conviene calcularlo con computeEndAt antes. */
  endAt: string;
  status?: AppointmentStatus;
  notes?: string | null;
}

/** Datos del formulario público de reserva online. */
export interface OnlineBookingInput {
  clientName: string;
  clientPhone: string;
  serviceId: string | null;
  serviceName: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
}

/** Filtro de listado por rango de fechas (ISO) y status opcional. */
export interface ListAppointmentsParams {
  /** ISO datetime inferior (inclusive). */
  from: string;
  /** ISO datetime superior (exclusive). */
  to: string;
  status?: AppointmentStatus;
}

export async function listAppointments(
  params: ListAppointmentsParams,
): Promise<Appointment[]> {
  const db = assertSupabase();
  let query = db
    .from('appointments')
    .select('*')
    .gte('start_at', params.from)
    .lt('start_at', params.to)
    .order('start_at', { ascending: true });
  if (params.status) query = query.eq('status', params.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as AppointmentRow[]).map(rowToAppointment);
}

/** Lista las reservas de origen online (inbox de Reservas). */
export async function listOnlineAppointments(
  status?: AppointmentStatus,
): Promise<Appointment[]> {
  const db = assertSupabase();
  let query = db
    .from('appointments')
    .select('*')
    .eq('source', 'online')
    .order('start_at', { ascending: true });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as AppointmentRow[]).map(rowToAppointment);
}

export async function createAppointment(
  input: AppointmentInput,
): Promise<Appointment> {
  const db = assertSupabase();
  const row = {
    client_name: input.clientName.trim(),
    client_phone: input.clientPhone.trim(),
    service_id: input.serviceId,
    service_name: input.serviceName.trim(),
    staff_id: input.staffId,
    start_at: input.startAt,
    end_at: input.endAt,
    status: input.status ?? 'confirmed',
    notes: input.notes?.trim() || null,
    source: 'admin' as const,
  };
  const { data, error } = await db
    .from('appointments')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToAppointment(data as AppointmentRow);
}

export async function updateAppointment(
  id: string,
  patch: Partial<AppointmentInput>,
): Promise<Appointment> {
  const db = assertSupabase();
  // Patch parcial en snake_case; solo se envían los campos presentes.
  const dbPatch: Partial<Omit<AppointmentRow, 'id' | 'created_at' | 'source'>> = {};
  if (patch.clientName !== undefined) dbPatch.client_name = patch.clientName.trim();
  if (patch.clientPhone !== undefined) dbPatch.client_phone = patch.clientPhone.trim();
  if (patch.serviceId !== undefined) dbPatch.service_id = patch.serviceId;
  if (patch.serviceName !== undefined) dbPatch.service_name = patch.serviceName.trim();
  if (patch.staffId !== undefined) dbPatch.staff_id = patch.staffId;
  if (patch.startAt !== undefined) dbPatch.start_at = patch.startAt;
  if (patch.endAt !== undefined) dbPatch.end_at = patch.endAt;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes?.trim() || null;

  const { data, error } = await db
    .from('appointments')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToAppointment(data as AppointmentRow);
}

export async function updateStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToAppointment(data as AppointmentRow);
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('appointments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Inserta una solicitud de reserva desde el formulario público (anon).
 * Fuerza status='pending' y source='online' para cumplir la policy RLS
 * `appointments_anon_insert`. No usa `assertSupabase()` con guarda de admin,
 * pero sí requiere que el cliente exista; si no, devuelve error legible.
 */
export async function createOnlineBooking(
  input: OnlineBookingInput,
): Promise<Appointment> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Las reservas en linea no estan disponibles en este momento. Escribenos por WhatsApp y te ayudamos.',
    );
  }
  const row = {
    client_name: input.clientName.trim(),
    client_phone: input.clientPhone.trim(),
    service_id: input.serviceId,
    service_name: input.serviceName.trim(),
    staff_id: null,
    start_at: input.startAt,
    end_at: input.endAt,
    status: 'pending' as const,
    notes: input.notes?.trim() || null,
    source: 'online' as const,
  };
  const { data, error } = await supabase
    .from('appointments')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToAppointment(data as AppointmentRow);
}

/**
 * Lista pública de servicios para el formulario de reserva. Reutiliza el
 * repositorio de servicios (lectura permitida a anon por RLS). Si Supabase no
 * esta configurado, devuelve [] para que la UI muestre el fallback de WhatsApp.
 */
export async function listPublicServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return [];
  return listServices();
}
