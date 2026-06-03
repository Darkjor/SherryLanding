/**
 * Sherry Studio — Entry placeholder reutilizable para módulos en construcción.
 *
 * Cada ruta stub usa este entry con su `active`. Cuando el agente responsable
 * implemente el módulo real, debe reemplazar el island de la página por uno
 * que renderice <AdminPage active="..."><XModule/></AdminPage> (ver
 * AdminPage.tsx). Este archivo puede quedar sin uso entonces.
 */
import AdminPage from '../AdminPage';
import { EmptyState } from '../ui';
import type { NavKey } from '../AppShell';

interface StubEntryProps {
  active: NavKey;
}

export default function StubEntry({ active }: StubEntryProps) {
  return (
    <AdminPage active={active}>
      <EmptyState
        title="En construcción"
        description="Este módulo se completará en breve."
      />
    </AdminPage>
  );
}
