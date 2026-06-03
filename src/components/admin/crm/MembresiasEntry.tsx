/**
 * Sherry Studio — Entry de Membresías.
 * Monta AdminPage(active="membresias") + el módulo. Ver AdminPage.tsx.
 */
import AdminPage from '../AdminPage';
import MembresiasModule from './MembresiasModule';

export default function MembresiasEntry() {
  return (
    <AdminPage active="membresias">
      <MembresiasModule />
    </AdminPage>
  );
}
