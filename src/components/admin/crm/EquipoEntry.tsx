/**
 * Sherry Studio — Entry de Equipo.
 * Monta AdminPage(active="equipo") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import EquipoModule from './EquipoModule';

export default function EquipoEntry() {
  return (
    <AdminPage active="equipo">
      <EquipoModule />
    </AdminPage>
  );
}
