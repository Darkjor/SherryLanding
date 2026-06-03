/**
 * Sherry Studio — Sección Gestos del editor de contenido.
 * CRUD de gestos (number, name, description) con reordenamiento.
 */
import { useState } from 'react';
import type { Gesture } from '../../../../lib/types';
import {
  listGestures,
  createGesture,
  updateGesture,
  deleteGesture,
  reorderGestures,
  type GestureInput,
} from '../../../../lib/db/content';
import {
  Button,
  Table,
  Field,
  TextareaField,
  ConfirmInline,
  EmptyState,
  type Column,
} from '../../ui';
import Drawer from '../../catalog/Drawer';
import { useCrudList, type CrudRepo } from './useCrudList';

const repo: CrudRepo<Gesture, GestureInput> = {
  list: listGestures,
  create: createGesture,
  update: updateGesture,
  remove: deleteGesture,
  reorder: reorderGestures,
};

interface FormState {
  number: string;
  name: string;
  description: string;
}

const EMPTY: FormState = { number: '', name: '', description: '' };

export default function GestosSection() {
  const crud = useCrudList(repo, {
    saved: 'Guardado. Usa Publicar cambios para reflejarlo en el sitio.',
    deleted: 'Gesto eliminado.',
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: Gesture) {
    setEditingId(item.id);
    setForm({
      number: item.number,
      name: item.name,
      description: item.description,
    });
    setErrors({});
    setOpen(true);
  }

  async function handleSave() {
    const found: Partial<FormState> = {};
    if (!form.number.trim()) found.number = 'El número es obligatorio.';
    if (!form.name.trim()) found.name = 'El nombre es obligatorio.';
    if (!form.description.trim())
      found.description = 'La descripción es obligatoria.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: GestureInput = {
      number: form.number.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    };
    setSaving(true);
    const ok = editingId
      ? await crud.update(editingId, input)
      : await crud.create(input);
    setSaving(false);
    if (ok) setOpen(false);
  }

  if (crud.state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudo cargar"
        description={`Hubo un problema al consultar Supabase: ${crud.state.message}`}
      />
    );
  }

  const loading = crud.state.kind === 'loading';

  const columns: Column<Gesture>[] = [
    {
      key: 'order',
      header: 'Orden',
      width: 'w-24',
      cell: (row) => {
        const index = crud.items.findIndex((i) => i.id === row.id);
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Subir"
              disabled={index <= 0}
              onClick={() => void crud.move(index, -1)}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Bajar"
              disabled={index >= crud.items.length - 1}
              onClick={() => void crud.move(index, 1)}
            >
              ↓
            </Button>
          </div>
        );
      },
    },
    {
      key: 'number',
      header: 'Núm.',
      width: 'w-20',
      cell: (row) => <span className="font-serif text-gold-dark">{row.number}</span>,
    },
    {
      key: 'name',
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'description',
      header: 'Descripción',
      hideOnMobile: true,
      cell: (row) => (
        <span className="line-clamp-2 text-gris">{row.description}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <ConfirmInline
            question="¿Eliminar este gesto?"
            confirmLabel="Eliminar"
            onConfirm={() => crud.remove(row)}
            trigger={(ask) => (
              <Button variant="danger" size="sm" onClick={ask}>
                Eliminar
              </Button>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openCreate}>
          Nuevo gesto
        </Button>
      </div>

      <Table
        columns={columns}
        rows={crud.items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin gestos"
        emptyDescription="Crea el primer gesto."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nuevo gesto
          </Button>
        }
      />

      <Drawer
        open={open}
        title={editingId ? 'Editar gesto' : 'Nuevo gesto'}
        onClose={() => !saving && setOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field
            label="Número"
            required
            placeholder="01"
            value={form.number}
            error={errors.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          />
          <Field
            label="Nombre"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextareaField
            label="Descripción"
            required
            rows={5}
            value={form.description}
            error={errors.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
      </Drawer>
    </div>
  );
}
