/**
 * Sherry Studio — Entry del dashboard.
 * Monta AdminPage(active) + el módulo. Ver AdminPage.tsx para la convención.
 */
import AdminPage from '../AdminPage';
import DashboardModule from '../DashboardModule';

export default function DashboardEntry() {
  return (
    <AdminPage active="dashboard">
      <DashboardModule />
    </AdminPage>
  );
}
