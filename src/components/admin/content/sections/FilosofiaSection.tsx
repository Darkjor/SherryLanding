/**
 * Sherry Studio — Sección Filosofía del editor de contenido.
 * CRUD de principios (number, title, body) con reordenamiento.
 */
import { useState } from 'react';
import type { Principle } from '../../../../lib/types';
import {
  listPhilosophy,
  createPrinciple,
  updatePrinciple,
  deletePrinciple,
  reorderPhilosophy,
  type PrincipleInput,
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

const repo: CrudRepo<Principle, PrincipleInput> = {
  list: listPhilosophy,
  create: createPrinciple,
  update: updatePrinciple,
  remove: deletePrinciple,
  reorder: reorderPhilosophy,
};

interface FormState {
  number: string;
  title: string;
  body: string;
}

const EMPTY: FormState = { number: '', title: '', body: '' };

export default function FilosofiaSection() {
  const crud = useCrudList(repo, {
    saved: 'Guardado. Usa Publicar cambios para reflejarlo en el sitio.',
    deleted: 'Principio eliminado.',
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

  function openEdit(item: Principle) {
    setEditingId(item.id);
    setForm({ number: item.number, title: item.title, body: item.body });
    setErrors({});
    setOpen(true);
  }

  async function handleSave() {
    const found: Partial<FormState> = {};
    if (!form.number.trim()) found.number = 'El número es obligatorio.';
    if (!form.title.trim()) found.title = 'El título es obligatorio.';
    if (!form.body.trim()) found.body = 'El cuerpo es obligatorio.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: PrincipleInput = {
      number: form.number.trim(),
      title: form.title.trim(),
      body: form.body.trim(),
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

  const columns: Column<Principle>[] = [
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
      key: 'title',
      header: 'Título',
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'body',
      header: 'Cuerpo',
      hideOnMobile: true,
      cell: (row) => <span className="line-clamp-2 text-gris">{row.body}</span>,
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
            question="¿Eliminar este principio?"
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
          Nuevo principio
        </Button>
      </div>

      <Table
        columns={columns}
        rows={crud.items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin principios"
        emptyDescription="Crea el primer principio de la filosofía."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nuevo principio
          </Button>
        }
      />

      <Drawer
        open={open}
        title={editingId ? 'Editar principio' : 'Nuevo principio'}
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
            label="Título"
            required
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextareaField
            label="Cuerpo"
            required
            rows={6}
            value={form.body}
            error={errors.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </div>
      </Drawer>
    </div>
  );
}
