/**
 * Sherry Studio — Punto de entrada de cada página del admin.
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  CONVENCIÓN PARA AGENTES 4/6/7/8 (módulos):                             │
 * │                                                                         │
 * │  Cada página del panel es un .astro mínimo que usa AdminLayout y        │
 * │  monta UN island React. Ese island es simplemente:                      │
 * │                                                                         │
 * │      import AdminPage from '../../components/admin/AdminPage';          │
 * │      import ClientesModule from '../../components/admin/ClientesModule';│
 * │      export default () => (                                             │
 * │        <AdminPage active="clientes">                                    │
 * │          <ClientesModule />                                             │
 * │        </AdminPage>                                                      │
 * │      );                                                                 │
 * │                                                                         │
 * │  AdminPage aporta: AuthGuard (sesión) + ToastProvider (avisos) +        │
 * │  AppShell (sidebar/topbar) con la clave `active` resaltada. Los         │
 * │  módulos NO deben re-montar guard, toasts ni shell; solo su contenido.  │
 * │  Usa `useToast()` dentro del módulo para emitir avisos.                 │
 * └───────────────────────────────────────────────────────────────────────┘
 */
import type { ReactNode } from 'react';
import AuthGuard from './AuthGuard';
import AppShell, { type NavKey } from './AppShell';
import { ToastProvider } from './ui';

interface AdminPageProps {
  active: NavKey;
  children: ReactNode;
}

export default function AdminPage({ active, children }: AdminPageProps) {
  return (
    <AuthGuard>
      <ToastProvider>
        <AppShell active={active}>{children}</AppShell>
      </ToastProvider>
    </AuthGuard>
  );
}
