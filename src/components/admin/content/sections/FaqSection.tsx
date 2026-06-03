/**
 * Sherry Studio — Sección FAQ del editor de contenido.
 * CRUD de preguntas frecuentes con reordenamiento.
 */
import { useState } from 'react';
import type { FAQItem } from '../../../../lib/types';
import {
  listFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaq,
  type FAQInput,
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

const repo: CrudRepo<FAQItem, FAQInput> = {
  list: listFaq,
  create: createFaq,
  update: updateFaq,
  remove: deleteFaq,
  reorder: reorderFaq,
};

interface FormState {
  question: string;
  answer: string;
}

const EMPTY: FormState = { question: '', answer: '' };

export default function FaqSection() {
  const crud = useCrudList(repo, {
    saved: 'Guardado. Usa Publicar cambios para reflejarlo en el sitio.',
    deleted: 'Pregunta eliminada.',
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

  function openEdit(item: FAQItem) {
    setEditingId(item.id);
    setForm({ question: item.question, answer: item.answer });
    setErrors({});
    setOpen(true);
  }

  async function handleSave() {
    const found: Partial<FormState> = {};
    if (!form.question.trim()) found.question = 'La pregunta es obligatoria.';
    if (!form.answer.trim()) found.answer = 'La respuesta es obligatoria.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: FAQInput = {
      question: form.question.trim(),
      answer: form.answer.trim(),
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

  const columns: Column<FAQItem>[] = [
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
      key: 'question',
      header: 'Pregunta',
      cell: (row) => <span className="font-medium">{row.question}</span>,
    },
    {
      key: 'answer',
      header: 'Respuesta',
      hideOnMobile: true,
      cell: (row) => (
        <span className="line-clamp-2 text-gris">{row.answer}</span>
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
            question="¿Eliminar esta pregunta?"
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
          Nueva pregunta
        </Button>
      </div>

      <Table
        columns={columns}
        rows={crud.items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin preguntas"
        emptyDescription="Crea la primera pregunta frecuente."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nueva pregunta
          </Button>
        }
      />

      <Drawer
        open={open}
        title={editingId ? 'Editar pregunta' : 'Nueva pregunta'}
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
            label="Pregunta"
            required
            value={form.question}
            error={errors.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          />
          <TextareaField
            label="Respuesta"
            required
            rows={5}
            value={form.answer}
            error={errors.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
          />
        </div>
      </Drawer>
    </div>
  );
}
