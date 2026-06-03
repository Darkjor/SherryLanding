/**
 * Sherry Studio — Getters de contenido en BUILD TIME con fallback local.
 *
 * Cada getter intenta leer de Supabase (solo si está configurado) ordenando por
 * `sort_order` y mapeando filas snake_case → las formas camelCase que esperan
 * los componentes de la landing. Ante CUALQUIER error, resultado vacío, o si
 * Supabase no está configurado, devuelve el array de fallback de src/data/*.ts.
 * Nunca lanza.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './supabase';
import type {
  Service,
  Membership,
  MembershipBenefit,
  Testimonial,
  FAQItem,
  Gesture,
  Principle,
  SiteSettings,
} from './types';

import { services as servicesFallback } from '../data/services';
import { memberships as membershipsFallback } from '../data/memberships';
import { testimonials as testimonialsFallback } from '../data/testimonials';
import { faqItems as faqFallback } from '../data/faq';
import { gestures as gesturesFallback } from '../data/gestures';
import { principles as principlesFallback } from '../data/philosophy';

/**
 * Cliente de lectura dedicado para build/servidor. Sin persistencia de sesión.
 * Solo se crea cuando Supabase está configurado.
 */
function getReadClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  const url: string = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const anonKey: string = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** Default de SiteSettings (placeholders actuales de la landing). */
const siteSettingsFallback: SiteSettings = {
  whatsapp: '',
  email: '',
  address: '',
  instagram: '',
  hours: [
    'Lun–Vie 9:00–20:00 h',
    'Sáb 9:00–18:00 h',
    'Dom 10:00–17:00 h',
  ],
};

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export async function getServices(): Promise<Service[]> {
  const client = getReadClient();
  if (!client) return servicesFallback as Service[];
  try {
    const { data, error } = await client
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getServices: usando fallback local.', error?.message ?? '');
      return servicesFallback as Service[];
    }
    // Filas DB son dinámicas (snake_case); las normalizamos aquí.
    return data.map((row: Record<string, unknown>, i): Service => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      description: String(row.description ?? ''),
      priceRange: String(row.price_range ?? ''),
      durationMin: Number(row.duration_min ?? 0),
      frequency: String(row.frequency ?? ''),
      category: (row.category as Service['category']) ?? 'nails',
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getServices: error, usando fallback local.', err);
    return servicesFallback as Service[];
  }
}

export async function getMemberships(): Promise<Membership[]> {
  const client = getReadClient();
  if (!client) return membershipsFallback as Membership[];
  try {
    const { data, error } = await client
      .from('memberships')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getMemberships: usando fallback local.', error?.message ?? '');
      return membershipsFallback as Membership[];
    }
    return data.map((row: Record<string, unknown>, i): Membership => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      price: Number(row.price ?? 0),
      priceDisplay: String(row.price_display ?? ''),
      period: String(row.period ?? ''),
      tagline: String(row.tagline ?? ''),
      benefits: Array.isArray(row.benefits)
        ? (row.benefits as MembershipBenefit[])
        : [],
      savings: String(row.savings ?? ''),
      recommended: Boolean(row.recommended ?? false),
      ctaText: String(row.cta_text ?? ''),
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getMemberships: error, usando fallback local.', err);
    return membershipsFallback as Membership[];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const client = getReadClient();
  if (!client) return testimonialsFallback as Testimonial[];
  try {
    const { data, error } = await client
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getTestimonials: usando fallback local.', error?.message ?? '');
      return testimonialsFallback as Testimonial[];
    }
    return data.map((row: Record<string, unknown>, i): Testimonial => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      role: String(row.role ?? ''),
      quote: String(row.quote ?? ''),
      rating: Number(row.rating ?? 5),
      avatarUrl: (row.avatar_url as string | null) ?? null,
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getTestimonials: error, usando fallback local.', err);
    return testimonialsFallback as Testimonial[];
  }
}

export async function getFaq(): Promise<FAQItem[]> {
  const client = getReadClient();
  if (!client) return faqFallback as unknown as FAQItem[];
  try {
    const { data, error } = await client
      .from('faq')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getFaq: usando fallback local.', error?.message ?? '');
      return faqFallback as unknown as FAQItem[];
    }
    return data.map((row: Record<string, unknown>, i): FAQItem => ({
      id: String(row.id ?? ''),
      question: String(row.question ?? ''),
      answer: String(row.answer ?? ''),
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getFaq: error, usando fallback local.', err);
    return faqFallback as unknown as FAQItem[];
  }
}

export async function getGestures(): Promise<Gesture[]> {
  const client = getReadClient();
  if (!client) return gesturesFallback as unknown as Gesture[];
  try {
    const { data, error } = await client
      .from('gestures')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getGestures: usando fallback local.', error?.message ?? '');
      return gesturesFallback as unknown as Gesture[];
    }
    return data.map((row: Record<string, unknown>, i): Gesture => ({
      id: String(row.id ?? ''),
      number: String(row.number ?? ''),
      name: String(row.name ?? ''),
      description: String(row.description ?? ''),
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getGestures: error, usando fallback local.', err);
    return gesturesFallback as unknown as Gesture[];
  }
}

export async function getPrinciples(): Promise<Principle[]> {
  const client = getReadClient();
  if (!client) return principlesFallback as unknown as Principle[];
  try {
    const { data, error } = await client
      .from('philosophy')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('[content] getPrinciples: usando fallback local.', error?.message ?? '');
      return principlesFallback as unknown as Principle[];
    }
    return data.map((row: Record<string, unknown>, i): Principle => ({
      id: String(row.id ?? ''),
      number: String(row.number ?? ''),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      sortOrder: Number(row.sort_order ?? i),
    }));
  } catch (err) {
    console.warn('[content] getPrinciples: error, usando fallback local.', err);
    return principlesFallback as unknown as Principle[];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const client = getReadClient();
  if (!client) return siteSettingsFallback;
  try {
    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      console.warn('[content] getSiteSettings: usando fallback local.', error?.message ?? '');
      return siteSettingsFallback;
    }
    const row = data as Record<string, unknown>;
    const hours = Array.isArray(row.hours) && row.hours.length > 0
      ? (row.hours as string[])
      : siteSettingsFallback.hours;
    return {
      whatsapp: String(row.whatsapp ?? ''),
      email: String(row.email ?? ''),
      address: String(row.address ?? ''),
      instagram: String(row.instagram ?? ''),
      hours,
    };
  } catch (err) {
    console.warn('[content] getSiteSettings: error, usando fallback local.', err);
    return siteSettingsFallback;
  }
}
