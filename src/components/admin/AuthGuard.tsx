/**
 * Sherry Studio — Guard de rutas React.
 *
 * Mientras carga muestra un estado mínimo de marca. Sin sesión redirige al
 * login (respetando el base path de Astro). Con sesión renderiza los hijos.
 */
import { useEffect, type ReactNode } from 'react';
import { useSession } from './useSession';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) {
      // BASE_URL termina en '/', p.ej. '/SherryLanding/'.
      window.location.replace(`${import.meta.env.BASE_URL}admin/login`);
    }
  }, [loading, session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <p className="font-sans text-sm tracking-widest uppercase text-gris">
          Cargando…
        </p>
      </div>
    );
  }

  if (!session) {
    // Redirección en curso; no renderizamos el contenido protegido.
    return null;
  }

  return <>{children}</>;
}
