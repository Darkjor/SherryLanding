/**
 * Sherry Studio — Sección Testimonios del editor de contenido.
 * CRUD de testimonios (name, role, quote, rating 1-5, avatar opcional) con
 * subida de imagen al bucket `media` de Supabase Storage y reordenamiento.
 */
import { useState } from 'react';
import type { Testimonial } from '../../../../lib/types';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  uploadAvatar,
  type TestimonialInput,
} from '../../../../lib/db/content';
import {
  Button,
  Table,
  Field,
  TextareaField,
  SelectField,
  ConfirmInline,
  EmptyState,
  useToast,
  type Column,
} from '../../ui';
import Drawer from '../../catalog/Drawer';
import { useCrudList, type CrudRepo } from './useCrudList';

const repo: CrudRepo<Testimonial, TestimonialInput> = {
  list: listTestimonials,
  create: createTestimonial,
  update: updateTestimonial,
  remove: deleteTestimonial,
  reorder: reorderTestimonials,
};

interface FormState {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
}

const EMPTY: FormState = {
  name: '',
  role: '',
  quote: '',
  rating: 5,
  avatarUrl: null,
};

export default function TestimoniosSection() {
  const toast = useToast();
  const crud = useCrudList(repo, {
    saved: 'Guardado. Usa Publicar cambios para reflejarlo en el sitio.',
    deleted: 'Testimonio eliminado.',
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<{ name?: string; role?: string; quote?: string }>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      quote: item.quote,
      rating: item.rating,
      avatarUrl: item.avatarUrl,
    });
    setErrors({});
    setOpen(true);
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: url }));
      toast.success('Avatar subido.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir.';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const found: { name?: string; role?: string; quote?: string } = {};
    if (!form.name.trim()) found.name = 'El nombre es obligatorio.';
    if (!form.role.trim()) found.role = 'El rol es obligatorio.';
    if (!form.quote.trim()) found.quote = 'La cita es obligatoria.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: TestimonialInput = {
      name: form.name.trim(),
      role: form.role.trim(),
      quote: form.quote.trim(),
      rating: form.rating,
      avatarUrl: form.avatarUrl,
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

  const columns: Column<Testimonial>[] = [
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
      key: 'name',
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      hideOnMobile: true,
      cell: (row) => row.role,
    },
    {
      key: 'rating',
      header: 'Rating',
      align: 'center',
      cell: (row) => `${row.rating}/5`,
    },
    {
      key: 'quote',
      header: 'Cita',
      hideOnMobile: true,
      cell: (row) => <span className="line-clamp-2 text-gris">{row.quote}</span>,
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
            question="¿Eliminar este testimonio?"
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
          Nuevo testimonio
        </Button>
      </div>

      <Table
        columns={columns}
        rows={crud.items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin testimonios"
        emptyDescription="Crea el primer testimonio."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nuevo testimonio
          </Button>
        }
      />

      <Drawer
        open={open}
        title={editingId ? 'Editar testimonio' : 'Nuevo testimonio'}
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
            label="Nombre"
            required
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Field
            label="Rol"
            required
            placeholder="Clienta desde 2022"
            value={form.role}
            error={errors.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          />
          <TextareaField
            label="Cita"
            required
            rows={4}
            value={form.quote}
            error={errors.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          />
          <SelectField
            label="Rating"
            required
            value={String(form.rating)}
            onChange={(e) =>
              setForm((f) => ({ ...f, rating: Number(e.target.value) }))
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} de 5
              </option>
            ))}
          </SelectField>

          <div>
            <span className="mb-1.5 block font-sans text-xs font-semibold tracking-wide uppercase text-burgundy">
              Avatar (opcional)
            </span>
            {form.avatarUrl && (
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={form.avatarUrl}
                  alt="Vista previa del avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, avatarUrl: null }))}
                >
                  Quitar
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => void handleUpload(e.target.files?.[0])}
              className="block w-full font-sans text-sm text-gris file:mr-3 file:rounded-lg file:border file:border-gris-light file:bg-bone file:px-3 file:py-2 file:font-semibold file:text-burgundy hover:file:bg-burgundy/5"
            />
            {uploading && (
              <p className="mt-1.5 font-sans text-xs text-gris">Subiendo…</p>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
