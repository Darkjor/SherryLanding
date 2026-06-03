/**
 * Sherry Studio — Hook reutilizable de lista CRUD con orden.
 *
 * Encapsula el patrón común de las secciones de contenido (testimonios, faq,
 * gestos, filosofía): cargar, crear, actualizar, borrar y reordenar con
 * actualizaciones optimistas y feedback por toast. Tipado por entidad y por
 * input; sin `any`.
 */
import { useEffect, useState } from 'react';
import { useToast } from '../../ui';

export const PUBLISH_REMINDER =
  'Guardado. Usa Publicar cambios para reflejarlo en el sitio.';

export interface OrderedEntity {
  id: string;
}

export interface CrudRepo<T extends OrderedEntity, I> {
  list: () => Promise<T[]>;
  create: (input: I) => Promise<T>;
  update: (id: string, patch: Partial<I>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  reorder: (idsInOrder: string[]) => Promise<void>;
}

export type CrudState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

export interface CrudListApi<T extends OrderedEntity, I> {
  state: CrudState;
  items: T[];
  create: (input: I) => Promise<boolean>;
  update: (id: string, input: I) => Promise<boolean>;
  remove: (item: T) => Promise<void>;
  move: (index: number, direction: -1 | 1) => Promise<void>;
}

function errMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useCrudList<T extends OrderedEntity, I>(
  repo: CrudRepo<T, I>,
  labels: { saved: string; deleted: string },
): CrudListApi<T, I> {
  const toast = useToast();
  const [state, setState] = useState<CrudState>({ kind: 'loading' });
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let active = true;
    repo
      .list()
      .then((rows) => {
        if (!active) return;
        setItems(rows);
        setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setState({ kind: 'error', message: errMessage(err, 'Error al cargar.') });
      });
    return () => {
      active = false;
    };
    // repo es estable (definido a nivel módulo); intencional cargar una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(input: I): Promise<boolean> {
    try {
      const created = await repo.create(input);
      setItems((prev) => [...prev, created]);
      toast.success(labels.saved);
      return true;
    } catch (err: unknown) {
      toast.error(errMessage(err, 'Error al guardar.'));
      return false;
    }
  }

  async function update(id: string, input: I): Promise<boolean> {
    try {
      const updated = await repo.update(id, input);
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      toast.success(labels.saved);
      return true;
    } catch (err: unknown) {
      toast.error(errMessage(err, 'Error al guardar.'));
      return false;
    }
  }

  async function remove(item: T): Promise<void> {
    const prev = items;
    setItems((list) => list.filter((it) => it.id !== item.id));
    try {
      await repo.remove(item.id);
      toast.success(labels.deleted);
    } catch (err: unknown) {
      setItems(prev);
      toast.error(errMessage(err, 'Error al eliminar.'));
    }
  }

  async function move(index: number, direction: -1 | 1): Promise<void> {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const prev = items;
    const next = [...items];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setItems(next);
    try {
      await repo.reorder(next.map((it) => it.id));
    } catch (err: unknown) {
      setItems(prev);
      toast.error(errMessage(err, 'Error al reordenar.'));
    }
  }

  return { state, items, create, update, remove, move };
}
