/**
 * Sherry Studio — Entry de Agenda.
 * Monta AdminPage(active="agenda") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import AgendaModule from './AgendaModule';

export default function AgendaEntry() {
  return (
    <AdminPage active="agenda">
      <AgendaModule />
    </AdminPage>
  );
}
