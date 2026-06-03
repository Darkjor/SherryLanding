/**
 * Sherry Studio — App shell del panel (sidebar + topbar + main frame).
 *
 * Layout responsive:
 *  - Escritorio: sidebar fija a la izquierda (superficie burgundy), main scrolleable.
 *  - Móvil: sidebar como drawer deslizante, abierto desde el hamburguesa del topbar.
 *
 * El indicador de activo es un tinte de fondo gold + peso de texto (NO un
 * borde lateral). El topbar muestra el email de la sesión, "Publicar cambios"
 * y "Cerrar sesión".
 *
 * No envuelve AuthGuard ni ToastProvider: eso lo hace AdminPage, que es el
 * punto de entrada de cada página del admin.
 */
import { useState, type ReactNode } from 'react';
import { useSession } from './useSession';
import { signOut } from '../../lib/auth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Button, useToast } from './ui';

// ---------------------------------------------------------------------------
// Mapa ruta → etiqueta. Otros agentes (4/6/7/8) NO deben duplicar esto.
// Las hrefs se construyen con BASE_URL (termina en '/', p.ej. '/SherryLanding/').
// ---------------------------------------------------------------------------

export type NavKey =
  | 'dashboard'
  | 'agenda'
  | 'reservas'
  | 'clientes'
  | 'servicios'
  | 'membresias'
  | 'equipo'
  | 'ventas'
  | 'reportes'
  | 'contenido';

interface NavItem {
  key: NavKey;
  label: string;
  /** Segmento relativo tras `admin` (vacío = dashboard). */
  segment: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', segment: '' },
  { key: 'agenda', label: 'Agenda', segment: '/agenda' },
  { key: 'reservas', label: 'Reservas', segment: '/reservas' },
  { key: 'clientes', label: 'Clientes', segment: '/clientes' },
  { key: 'servicios', label: 'Servicios', segment: '/servicios' },
  { key: 'membresias', label: 'Membresías', segment: '/membresias' },
  { key: 'equipo', label: 'Equipo', segment: '/equipo' },
  { key: 'ventas', label: 'Ventas', segment: '/ventas' },
  { key: 'reportes', label: 'Reportes', segment: '/reportes' },
  { key: 'contenido', label: 'Contenido', segment: '/contenido' },
];

function adminHref(segment: string): string {
  return `${import.meta.env.BASE_URL}admin${segment}`;
}

const ACTIVE_LABEL: Record<NavKey, string> = NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.key] = item.label;
    return acc;
  },
  {} as Record<NavKey, string>,
);

// ---------------------------------------------------------------------------

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

export default function AppShell({ active, children }: AppShellProps) {
  const { user } = useSession();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handlePublish() {
    if (publishing) return;
    if (!isSupabaseConfigured) {
      toast.info(
        'Publicar requiere Supabase configurado. Revisa SETUP.md para conectarlo.',
      );
      return;
    }
    setPublishing(true);
    toast.info('Publicando…');
    try {
      const { error } = await supabase.functions.invoke('publish');
      if (error) {
        toast.error('No se pudo publicar. Inténtalo de nuevo.');
      } else {
        toast.success('Sitio actualizándose, ~1 min.');
      }
    } catch {
      toast.error('No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setPublishing(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut();
    window.location.replace(`${import.meta.env.BASE_URL}admin/login`);
  }

  const sidebar = (
    <nav aria-label="Navegación del panel" className="flex h-full flex-col">
      <div className="px-5 py-6">
        <span className="font-serif text-xl text-bone">
          <span className="text-gold" aria-hidden="true">
            ✦
          </span>{' '}
          Sherry Studio
        </span>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <a
                href={adminHref(item.segment)}
                aria-current={isActive ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 font-sans text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/20 font-semibold text-bone'
                    : 'font-medium text-bone/70 hover:bg-bone/10 hover:text-bone'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-bone">
      {/* Sidebar fija — escritorio */}
      <aside className="hidden w-60 shrink-0 bg-burgundy lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Drawer — móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-burgundy-dark/50"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-burgundy shadow-xl">
            {sidebar}
          </div>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-bone-dark bg-bone-light px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-burgundy hover:bg-burgundy/5 lg:hidden"
          >
            <span aria-hidden="true" className="block h-4 w-5">
              <span className="mb-1 block h-0.5 w-full bg-current" />
              <span className="mb-1 block h-0.5 w-full bg-current" />
              <span className="block h-0.5 w-full bg-current" />
            </span>
          </button>

          <h1 className="min-w-0 flex-1 truncate font-serif text-lg text-burgundy sm:text-xl">
            {ACTIVE_LABEL[active]}
          </h1>

          {user?.email && (
            <span className="hidden max-w-[14rem] truncate font-sans text-xs text-gris md:inline">
              {user.email}
            </span>
          )}

          <Button
            variant="gold"
            size="sm"
            loading={publishing}
            onClick={handlePublish}
          >
            Publicar cambios
          </Button>

          <Button
            variant="secondary"
            size="sm"
            loading={loggingOut}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
