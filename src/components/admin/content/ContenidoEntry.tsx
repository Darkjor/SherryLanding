/**
 * Sherry Studio — Entry de Contenido.
 * Monta AdminPage(active="contenido") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import ContenidoModule from './ContenidoModule';

export default function ContenidoEntry() {
  return (
    <AdminPage active="contenido">
      <ContenidoModule />
    </AdminPage>
  );
}
