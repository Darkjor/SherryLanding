/**
 * Sherry Studio — Helpers de autenticación (framework-agnósticos).
 *
 * Envuelven Supabase Auth (email + password) con mensajes en español y un
 * pequeño guard de rate-limiting en cliente. OJO: el lockout de cliente es
 * solo una mitigación de UX/brute-force superficial; la protección real son
 * las políticas RLS de Supabase y su propio rate-limiting de servidor.
 */
import type { Session } from '@supabase/supabase-js';
import { assertSupabase, isSupabaseConfigured, supabase } from './supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

// ----------------------------------------------------------------------------
// Lockout / rate-limiting en cliente (respaldado por localStorage)
// ----------------------------------------------------------------------------

const LOCKOUT_PREFIX = 'sherry-studio-lockout';
const ATTEMPTS_KEY = `${LOCKOUT_PREFIX}:attempts`;
const UNTIL_KEY = `${LOCKOUT_PREFIX}:until`;

/** Nº de fallos consecutivos que disparan el bloqueo. */
const MAX_ATTEMPTS = 5;
/** Duración del bloqueo, en ms. */
const LOCKOUT_MS = 60_000;

/** Acceso defensivo a localStorage (SSR / build no tienen window). */
function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readInt(key: string): number {
  const raw = storage()?.getItem(key);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Segundos restantes de bloqueo, o 0 si no está bloqueado.
 * Limpia el estado expirado de forma perezosa.
 */
function lockoutSecondsRemaining(): number {
  const store = storage();
  if (!store) return 0;
  const until = readInt(UNTIL_KEY);
  if (until <= 0) return 0;
  const remainingMs = until - Date.now();
  if (remainingMs <= 0) {
    store.removeItem(UNTIL_KEY);
    store.removeItem(ATTEMPTS_KEY);
    return 0;
  }
  return Math.ceil(remainingMs / 1000);
}

function registerFailure(): void {
  const store = storage();
  if (!store) return;
  const attempts = readInt(ATTEMPTS_KEY) + 1;
  store.setItem(ATTEMPTS_KEY, String(attempts));
  if (attempts >= MAX_ATTEMPTS) {
    store.setItem(UNTIL_KEY, String(Date.now() + LOCKOUT_MS));
  }
}

function resetLockout(): void {
  const store = storage();
  if (!store) return;
  store.removeItem(ATTEMPTS_KEY);
  store.removeItem(UNTIL_KEY);
}

// ----------------------------------------------------------------------------
// API pública
// ----------------------------------------------------------------------------

/** Traduce errores conocidos de Supabase a mensajes en español. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Credenciales incorrectas.';
  }
  if (m.includes('email not confirmed')) {
    return 'Tu correo aún no está confirmado.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Demasiados intentos. Inténtalo más tarde.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'No se pudo conectar. Revisa tu conexión.';
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

/**
 * Inicia sesión con email + contraseña, con lockout de cliente.
 * Resetea el contador de fallos al lograrlo.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const blockedFor = lockoutSecondsRemaining();
  if (blockedFor > 0) {
    return {
      ok: false,
      error: `Demasiados intentos. Espera ${blockedFor} segundos.`,
    };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error: 'El acceso no está disponible: Supabase no está configurado.',
    };
  }

  try {
    const client = assertSupabase();
    const { error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      registerFailure();
      const remaining = lockoutSecondsRemaining();
      if (remaining > 0) {
        return {
          ok: false,
          error: `Demasiados intentos. Espera ${remaining} segundos.`,
        };
      }
      return { ok: false, error: friendlyError(error.message) };
    }

    resetLockout();
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
  }
}

/** Cierra la sesión actual. */
export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured) return { ok: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false, error: friendlyError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo cerrar la sesión.' };
  }
}

/** Devuelve la sesión actual o `null`. Nunca lanza. */
export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}
