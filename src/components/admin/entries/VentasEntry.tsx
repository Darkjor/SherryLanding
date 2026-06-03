/**
 * Sherry Studio — Entry de Ventas.
 * Monta AdminPage(active) + el módulo. Ver AdminPage.tsx para la convención.
 */
import AdminPage from '../AdminPage';
import VentasModule from '../sales/VentasModule';

export default function VentasEntry() {
  return (
    <AdminPage active="ventas">
      <VentasModule />
    </AdminPage>
  );
}
