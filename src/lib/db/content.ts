/**
 * Sherry Studio — Repositorio tipado de CONTENIDO de la landing.
 *
 * Capa fina sobre las tablas `testimonials`, `faq`, `gestures`, `philosophy`
 * y el singleton `site_settings`. Mapea snake_case (DB) a camelCase (types.ts)
 * y viceversa. Toda llamada está protegida por `assertSupabase()`: si Supabase
 * no está configurado, lanza un error legible que la UI captura y muestra.
 */
import { assertSupabase } from '../supabase';
import type {
  Testimonial,
  FAQItem,
  Gesture,
  Principle,
  SiteSettings,
} from '../types';

/** Genera un id legible (slug) con sufijo aleatorio. */
function slugId(text: string, prefix: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `${prefix}-${suffix}`;
}

/** sort_order siguiente (max + 1) para una tabla con esa columna. */
async function nextSortOrder(table: string): Promise<number> {
  const db = assertSupabase();
  const { data, error } = await db
    .from(table)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const top = (data ?? [])[0]?.sort_order as number | undefined;
  return top != null ? top + 1 : 0;
}

/** Reasigna sort_order (0..n-1) según el orden de ids recibido. */
async function reorderTable(
  table: string,
  idsInOrder: string[],
): Promise<void> {
  const db = assertSupabase();
  const updates = idsInOrder.map((id, index) =>
    db.from(table).update({ sort_order: index }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}

// ---------------------------------------------------------------------------
// TESTIMONIALS
// ---------------------------------------------------------------------------

interface TestimonialRow {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  sort_order: number;
}

export interface TestimonialInput {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    quote: row.quote,
    rating: row.rating,
    avatarUrl: row.avatar_url,
    sortOrder: row.sort_order,
  };
}

export async function listTestimonials(): Promise<Testimonial[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TestimonialRow[]).map(rowToTestimonial);
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<Testimonial> {
  const db = assertSupabase();
  const row: TestimonialRow = {
    id: slugId(input.name, 'testimonial'),
    name: input.name.trim(),
    role: input.role.trim(),
    quote: input.quote.trim(),
    rating: input.rating,
    avatar_url: input.avatarUrl,
    sort_order: await nextSortOrder('testimonials'),
  };
  const { data, error } = await db
    .from('testimonials')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToTestimonial(data as TestimonialRow);
}

export async function updateTestimonial(
  id: string,
  patch: Partial<TestimonialInput>,
): Promise<Testimonial> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<TestimonialRow, 'id'>> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.role !== undefined) dbPatch.role = patch.role.trim();
  if (patch.quote !== undefined) dbPatch.quote = patch.quote.trim();
  if (patch.rating !== undefined) dbPatch.rating = patch.rating;
  if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl;

  const { data, error } = await db
    .from('testimonials')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToTestimonial(data as TestimonialRow);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderTestimonials(
  idsInOrder: string[],
): Promise<void> {
  return reorderTable('testimonials', idsInOrder);
}

/**
 * Sube un avatar al bucket `media` y devuelve la URL pública.
 * Guardado por `assertSupabase()`: lanza si Supabase no está configurado.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const db = assertSupabase();
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
    : 'jpg';
  const path = `avatars/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const { error } = await db.storage
    .from('media')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(error.message);
  const { data } = db.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

interface FAQRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface FAQInput {
  question: string;
  answer: string;
}

function rowToFAQ(row: FAQRow): FAQItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  };
}

export async function listFaq(): Promise<FAQItem[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('faq')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as FAQRow[]).map(rowToFAQ);
}

export async function createFaq(input: FAQInput): Promise<FAQItem> {
  const db = assertSupabase();
  const row: FAQRow = {
    id: slugId(input.question, 'faq'),
    question: input.question.trim(),
    answer: input.answer.trim(),
    sort_order: await nextSortOrder('faq'),
  };
  const { data, error } = await db
    .from('faq')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToFAQ(data as FAQRow);
}

export async function updateFaq(
  id: string,
  patch: Partial<FAQInput>,
): Promise<FAQItem> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<FAQRow, 'id'>> = {};
  if (patch.question !== undefined) dbPatch.question = patch.question.trim();
  if (patch.answer !== undefined) dbPatch.answer = patch.answer.trim();

  const { data, error } = await db
    .from('faq')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToFAQ(data as FAQRow);
}

export async function deleteFaq(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('faq').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderFaq(idsInOrder: string[]): Promise<void> {
  return reorderTable('faq', idsInOrder);
}

// ---------------------------------------------------------------------------
// GESTURES (gestos)
// ---------------------------------------------------------------------------

interface GestureRow {
  id: string;
  number: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface GestureInput {
  number: string;
  name: string;
  description: string;
}

function rowToGesture(row: GestureRow): Gesture {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export async function listGestures(): Promise<Gesture[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('gestures')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as GestureRow[]).map(rowToGesture);
}

export async function createGesture(input: GestureInput): Promise<Gesture> {
  const db = assertSupabase();
  const row: GestureRow = {
    id: slugId(input.name, 'gesture'),
    number: input.number.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    sort_order: await nextSortOrder('gestures'),
  };
  const { data, error } = await db
    .from('gestures')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToGesture(data as GestureRow);
}

export async function updateGesture(
  id: string,
  patch: Partial<GestureInput>,
): Promise<Gesture> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<GestureRow, 'id'>> = {};
  if (patch.number !== undefined) dbPatch.number = patch.number.trim();
  if (patch.name !== undefined) dbPatch.name = patch.name.trim();
  if (patch.description !== undefined)
    dbPatch.description = patch.description.trim();

  const { data, error } = await db
    .from('gestures')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToGesture(data as GestureRow);
}

export async function deleteGesture(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('gestures').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderGestures(idsInOrder: string[]): Promise<void> {
  return reorderTable('gestures', idsInOrder);
}

// ---------------------------------------------------------------------------
// PHILOSOPHY (filosofía / principios)
// ---------------------------------------------------------------------------

interface PrincipleRow {
  id: string;
  number: string;
  title: string;
  body: string;
  sort_order: number;
}

export interface PrincipleInput {
  number: string;
  title: string;
  body: string;
}

function rowToPrinciple(row: PrincipleRow): Principle {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    body: row.body,
    sortOrder: row.sort_order,
  };
}

export async function listPhilosophy(): Promise<Principle[]> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('philosophy')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PrincipleRow[]).map(rowToPrinciple);
}

export async function createPrinciple(
  input: PrincipleInput,
): Promise<Principle> {
  const db = assertSupabase();
  const row: PrincipleRow = {
    id: slugId(input.title, 'principle'),
    number: input.number.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    sort_order: await nextSortOrder('philosophy'),
  };
  const { data, error } = await db
    .from('philosophy')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToPrinciple(data as PrincipleRow);
}

export async function updatePrinciple(
  id: string,
  patch: Partial<PrincipleInput>,
): Promise<Principle> {
  const db = assertSupabase();
  const dbPatch: Partial<Omit<PrincipleRow, 'id'>> = {};
  if (patch.number !== undefined) dbPatch.number = patch.number.trim();
  if (patch.title !== undefined) dbPatch.title = patch.title.trim();
  if (patch.body !== undefined) dbPatch.body = patch.body.trim();

  const { data, error } = await db
    .from('philosophy')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToPrinciple(data as PrincipleRow);
}

export async function deletePrinciple(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('philosophy').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderPhilosophy(idsInOrder: string[]): Promise<void> {
  return reorderTable('philosophy', idsInOrder);
}

// ---------------------------------------------------------------------------
// SITE SETTINGS (contacto — registro único id = 1)
// ---------------------------------------------------------------------------

interface SiteSettingsRow {
  id: number;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  hours: string[];
}

function rowToSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    whatsapp: row.whatsapp,
    email: row.email,
    address: row.address,
    instagram: row.instagram,
    hours: row.hours ?? [],
  };
}

const EMPTY_SETTINGS: SiteSettings = {
  whatsapp: '',
  email: '',
  address: '',
  instagram: '',
  hours: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = assertSupabase();
  const { data, error } = await db
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { ...EMPTY_SETTINGS };
  return rowToSiteSettings(data as SiteSettingsRow);
}

export async function updateSiteSettings(
  patch: SiteSettings,
): Promise<SiteSettings> {
  const db = assertSupabase();
  // upsert sobre el singleton id = 1 (lo crea si no existe).
  const row: SiteSettingsRow = {
    id: 1,
    whatsapp: patch.whatsapp.trim(),
    email: patch.email.trim(),
    address: patch.address.trim(),
    instagram: patch.instagram.trim(),
    hours: patch.hours.map((h) => h.trim()).filter((h) => h.length > 0),
  };
  const { data, error } = await db
    .from('site_settings')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToSiteSettings(data as SiteSettingsRow);
}
