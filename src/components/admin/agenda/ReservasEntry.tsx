/**
 * Sherry Studio — Entry de Reservas.
 * Monta AdminPage(active="reservas") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import ReservasModule from './ReservasModule';

export default function ReservasEntry() {
  return (
    <AdminPage active="reservas">
      <ReservasModule />
    </AdminPage>
  );
}
