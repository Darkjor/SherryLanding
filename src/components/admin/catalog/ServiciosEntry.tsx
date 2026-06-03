/**
 * Sherry Studio — Entry de Servicios.
 * Monta AdminPage(active="servicios") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import ServiciosModule from './ServiciosModule';

export default function ServiciosEntry() {
  return (
    <AdminPage active="servicios">
      <ServiciosModule />
    </AdminPage>
  );
}
