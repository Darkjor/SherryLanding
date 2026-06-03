/**
 * Sherry Studio — Hook de sesión React.
 *
 * Inicializa desde `getSession()` y se suscribe a los cambios de auth de
 * Supabase, limpiando la suscripción al desmontar.
 */
import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { getSession } from '../../lib/auth';

export interface UseSessionResult {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    // Sin configuración no hay sesión posible: salimos del estado de carga.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    getSession()
      .then((s) => {
        if (active) {
          setSession(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
