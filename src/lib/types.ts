/**
 * Sherry Studio — Contrato de tipos compartido.
 *
 * Fuente de verdad de las entidades del dominio, usado por:
 *  - La capa de datos (src/lib/db/*) y content.ts
 *  - El admin (módulos React en src/components/admin/*)
 *  - La landing (componentes Astro que consumen content.ts)
 *
 * Estos tipos reflejan el esquema de Supabase (snake_case en DB → camelCase aquí).
 * Las interfaces de CONTENIDO conservan compatibilidad con src/data/*.ts (fallback).
 */

// ----------------------------------------------------------------------------
// CONTENIDO DE MARKETING (build-time, con fallback a src/data/*.ts)
// ----------------------------------------------------------------------------

export type ServiceCategory =
  | 'nails'
  | 'feet'
  | 'hair'
  | 'experience'
  | 'retail'
  | 'events';

export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  /** Duración estimada en minutos — usada por la agenda para calcular el fin de la cita. */
  durationMin: number;
  frequency: string;
  category: ServiceCategory;
  sortOrder: number;
}

export interface MembershipBenefit {
  text: string;
  highlighted?: boolean;
}

export interface Membership {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  tagline: string;
  benefits: MembershipBenefit[];
  savings: string;
  recommended: boolean;
  ctaText: string;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  sortOrder: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface Gesture {
  id: string;
  number: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Principle {
  id: string;
  number: string;
  title: string;
  body: string;
  sortOrder: number;
}

/** Datos de contacto / ajustes del sitio (registro único). Resuelve los TODOs de contacto. */
export interface SiteSettings {
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  /** Horarios como líneas independientes (se renderizan en bloque). */
  hours: string[];
}

// ----------------------------------------------------------------------------
// OPERACIÓN (runtime, vía Supabase + Realtime)
// ----------------------------------------------------------------------------

export type MembershipTier = 'RITUAL' | 'MAISON' | 'SHERRY VIP' | null;

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  /** Membresía activa de la clienta (nombre del plan) o null. */
  membershipTier: MembershipTier;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  /** Especialidad o rol mostrado en la agenda. */
  role: string;
  active: boolean;
  sortOrder: number;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string | null;
  /** Datos de contacto capturados en la reserva online (cuando aún no hay clientId). */
  clientName: string;
  clientPhone: string;
  serviceId: string | null;
  serviceName: string;
  staffId: string | null;
  /** ISO datetime de inicio. */
  startAt: string;
  /** ISO datetime de fin (start + duración del servicio). */
  endAt: string;
  status: AppointmentStatus;
  notes: string | null;
  /** Origen: 'online' (form público) | 'admin' (capturada en panel). */
  source: 'online' | 'admin';
  createdAt: string;
}

/** Plan de membresía vendible + cuántos miembros activos tiene. */
export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface Member {
  id: string;
  clientId: string;
  planId: string;
  status: 'active' | 'paused' | 'cancelled';
  startedAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface SaleItem {
  id: string;
  saleId: string;
  /** Descripción libre (servicio o producto). */
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  appointmentId: string | null;
  clientId: string | null;
  items: SaleItem[];
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Helpers de resultado para la capa de datos (fallback / error handling)
// ----------------------------------------------------------------------------

export interface DataResult<T> {
  data: T;
  /** true cuando se usó el fallback local porque Supabase no respondió. */
  usedFallback: boolean;
  error?: string;
}
