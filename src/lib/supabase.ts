/**
 * Sherry Studio — Cliente Supabase (navegador).
 *
 * SEGURIDAD: aquí SOLO va la `anon` key (PUBLIC_SUPABASE_ANON_KEY). Es pública
 * por diseño y está pensada para vivir en el navegador; la seguridad real la
 * imponen las políticas RLS en Supabase. NUNCA expongas aquí la `service_role`
 * key ni ningún token de GitHub — eso comprometería toda la base de datos.
 *
 * Construcción defensiva: si las variables de entorno no están configuradas
 * (p.ej. durante el build de la landing antes de conectar Supabase), este
 * módulo NO lanza al importarse. Exporta `isSupabaseConfigured` para chequear,
 * y `assertSupabase()` para fallar con un mensaje amable solo cuando se usa.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey: string = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

/** `true` solo si ambas variables PUBLIC_SUPABASE_* tienen valor. */
export const isSupabaseConfigured: boolean =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Cliente singleton.
 *
 * `createClient` valida la URL y lanza si está vacía, incluso en build. Para
 * que el build de la landing nunca crashee cuando faltan las variables,
 * creamos el cliente real solo si está configurado; si no, exponemos un stub
 * tipado cuyo uso real fallará con un mensaje amable vía `assertSupabase()`.
 * `as SupabaseClient` es seguro: ningún método del stub se invoca sin pasar
 * antes por las guardas de `isSupabaseConfigured` / `assertSupabase`.
 */
function createUnconfiguredStub(): SupabaseClient {
  const fail = (): never => {
    throw new Error(
      'Supabase no está configurado. Define PUBLIC_SUPABASE_URL y ' +
        'PUBLIC_SUPABASE_ANON_KEY en tu archivo .env (ver .env.example).',
    );
  };
  return new Proxy({} as SupabaseClient, {
    get: fail,
    apply: fail,
  });
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'sherry-studio-auth',
      },
    })
  : createUnconfiguredStub();

/**
 * Devuelve el cliente garantizando que Supabase está configurado.
 * Lanza un error legible si se intenta usar sin variables de entorno.
 */
export function assertSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase no está configurado. Define PUBLIC_SUPABASE_URL y ' +
        'PUBLIC_SUPABASE_ANON_KEY en tu archivo .env (ver .env.example).',
    );
  }
  return supabase;
}
