/**
 * Sherry Studio — Entry de Clientes.
 * Monta AdminPage(active="clientes") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import ClientesModule from './ClientesModule';

export default function ClientesEntry() {
  return (
    <AdminPage active="clientes">
      <ClientesModule />
    </AdminPage>
  );
}
