/**
 * Sherry Studio — Entry de Reportes.
 * Monta AdminPage(active) + el módulo. Ver AdminPage.tsx para la convención.
 */
import AdminPage from '../AdminPage';
import ReportesModule from '../sales/ReportesModule';

export default function ReportesEntry() {
  return (
    <AdminPage active="reportes">
      <ReportesModule />
    </AdminPage>
  );
}
