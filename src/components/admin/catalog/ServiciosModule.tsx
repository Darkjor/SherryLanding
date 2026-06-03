/**
 * Sherry Studio — Módulo de SERVICIOS (catálogo).
 *
 * Tabla de servicios + alta/edición en drawer lateral (no modal), borrado con
 * confirmación inline y reordenamiento con botones subir/bajar. Actualizaciones
 * optimistas con feedback por toast. Estados de carga / vacío / "Supabase no
 * configurado". Tipado contra src/lib/types.ts.
 */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import type { Service, ServiceCategory } from '../../../lib/types';
import {
  createService,
  deleteService,
  listServices,
  reorderServices,
  updateService,
  type ServiceInput,
} from '../../../lib/db/services';
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
} from '../ui';
import Drawer from './Drawer';

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'nails', label: 'Uñas' },
  { value: 'feet', label: 'Pies' },
  { value: 'hair', label: 'Cabello' },
  { value: 'experience', label: 'Experiencia' },
  { value: 'retail', label: 'Retail' },
  { value: 'events', label: 'Eventos' },
];

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  nails: 'Uñas',
  feet: 'Pies',
  hair: 'Cabello',
  experience: 'Experiencia',
  retail: 'Retail',
  events: 'Eventos',
};

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

interface FormState {
  name: string;
  description: string;
  priceRange: string;
  durationMin: string;
  frequency: string;
  category: ServiceCategory;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  priceRange: '',
  durationMin: '60',
  frequency: '',
  category: 'nails',
};

interface FormErrors {
  name?: string;
  description?: string;
  priceRange?: string;
  durationMin?: string;
  frequency?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!form.description.trim())
    errors.description = 'La descripción es obligatoria.';
  if (!form.priceRange.trim()) errors.priceRange = 'El precio es obligatorio.';
  if (!form.frequency.trim()) errors.frequency = 'La frecuencia es obligatoria.';
  const duration = Number(form.durationMin);
  if (!Number.isFinite(duration) || duration <= 0)
    errors.durationMin = 'La duración debe ser mayor que 0.';
  return errors;
}

export default function ServiciosModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [services, setServices] = useState<Service[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    listServices()
      .then((rows) => {
        if (!active) return;
        setServices(rows);
        setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Error desconocido.';
        setState({ kind: 'error', message });
      });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(svc: Service) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description,
      priceRange: svc.priceRange,
      durationMin: String(svc.durationMin),
      frequency: svc.frequency,
      category: svc.category,
    });
    setErrors({});
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerOpen(false);
  }

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: ServiceInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      priceRange: form.priceRange.trim(),
      durationMin: Number(form.durationMin),
      frequency: form.frequency.trim(),
      category: form.category,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateService(editingId, input);
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s)),
        );
        toast.success('Servicio actualizado.');
      } else {
        const created = await createService(input);
        setServices((prev) => [...prev, created]);
        toast.success('Servicio creado.');
      }
      setDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(svc: Service) {
    const prev = services;
    setServices((list) => list.filter((s) => s.id !== svc.id)); // optimista
    try {
      await deleteService(svc.id);
      toast.success('Servicio eliminado.');
    } catch (err: unknown) {
      setServices(prev); // revertir
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const prev = services;
    const next = [...services];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setServices(next); // optimista
    try {
      await reorderServices(next.map((s) => s.id));
    } catch (err: unknown) {
      setServices(prev); // revertir
      const message = err instanceof Error ? err.message : 'Error al reordenar.';
      toast.error(message);
    }
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para gestionar el catálogo de servicios. Encontrarás los pasos en SETUP.md."
        action={
          <a
            href={SETUP_HREF}
            className="font-sans text-sm font-semibold text-burgundy underline underline-offset-4 hover:text-burgundy-light"
          >
            Ver SETUP.md
          </a>
        }
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudieron cargar los servicios"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';

  const columns: Column<Service>[] = [
    {
      key: 'order',
      header: 'Orden',
      width: 'w-24',
      cell: (row) => {
        const index = services.findIndex((s) => s.id === row.id);
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Subir"
              disabled={index <= 0}
              onClick={() => void move(index, -1)}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Bajar"
              disabled={index >= services.length - 1}
              onClick={() => void move(index, 1)}
            >
              ↓
            </Button>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Servicio',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'category',
      header: 'Categoría',
      hideOnMobile: true,
      cell: (row) => CATEGORY_LABEL[row.category],
    },
    {
      key: 'price',
      header: 'Precio',
      cell: (row) => row.priceRange,
    },
    {
      key: 'duration',
      header: 'Duración',
      hideOnMobile: true,
      cell: (row) => `${row.durationMin} min`,
    },
    {
      key: 'frequency',
      header: 'Frecuencia',
      hideOnMobile: true,
      cell: (row) => row.frequency,
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
            question="¿Eliminar este servicio?"
            confirmLabel="Eliminar"
            onConfirm={() => handleDelete(row)}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-burgundy">Servicios</h1>
          <p className="mt-1 font-sans text-sm text-gris">
            Gestiona el catálogo que se muestra en la landing.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Nuevo servicio
        </Button>
      </div>

      <Table
        columns={columns}
        rows={services}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin servicios"
        emptyDescription="Crea el primer servicio del catálogo."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nuevo servicio
          </Button>
        }
      />

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Editar servicio' : 'Nuevo servicio'}
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDrawer} disabled={saving}>
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
          <TextareaField
            label="Descripción"
            required
            value={form.description}
            error={errors.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <Field
            label="Precio"
            required
            placeholder="Desde $450"
            value={form.priceRange}
            error={errors.priceRange}
            onChange={(e) =>
              setForm((f) => ({ ...f, priceRange: e.target.value }))
            }
          />
          <Field
            label="Duración (min)"
            required
            type="number"
            min={1}
            value={form.durationMin}
            error={errors.durationMin}
            onChange={(e) =>
              setForm((f) => ({ ...f, durationMin: e.target.value }))
            }
          />
          <Field
            label="Frecuencia"
            required
            placeholder="Cada 3 semanas"
            value={form.frequency}
            error={errors.frequency}
            onChange={(e) =>
              setForm((f) => ({ ...f, frequency: e.target.value }))
            }
          />
          <SelectField
            label="Categoría"
            required
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value as ServiceCategory,
              }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectField>
        </div>
      </Drawer>
    </div>
  );
}
