/**
 * Sherry Studio — Módulo de EQUIPO (staff).
 *
 * CRUD de miembros del equipo (name, role, active) en drawer lateral, borrado
 * con confirmación inline y reordenamiento con botones subir/bajar.
 * Actualizaciones optimistas con feedback por toast. Estados de carga / vacío /
 * "Supabase no configurado". Tipado contra src/lib/types.ts.
 */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import type { Staff } from '../../../lib/types';
import {
  createStaff,
  deleteStaff,
  listStaff,
  reorderStaff,
  updateStaff,
  type StaffInput,
} from '../../../lib/db/staff';
import {
  Button,
  Table,
  Field,
  ConfirmInline,
  EmptyState,
  useToast,
  type Column,
} from '../ui';
import Drawer from './Drawer';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

interface FormState {
  name: string;
  role: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { name: '', role: '', active: true };

interface FormErrors {
  name?: string;
  role?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!form.role.trim()) errors.role = 'El rol es obligatorio.';
  return errors;
}

export default function EquipoModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [staff, setStaff] = useState<Staff[]>([]);

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
    listStaff()
      .then((rows) => {
        if (!active) return;
        setStaff(rows);
        setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : 'Error desconocido.';
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

  function openEdit(member: Staff) {
    setEditingId(member.id);
    setForm({ name: member.name, role: member.role, active: member.active });
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

    const input: StaffInput = {
      name: form.name.trim(),
      role: form.role.trim(),
      active: form.active,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateStaff(editingId, input);
        setStaff((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s)),
        );
        toast.success('Miembro actualizado.');
      } else {
        const created = await createStaff(input);
        setStaff((prev) => [...prev, created]);
        toast.success('Miembro creado.');
      }
      setDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: Staff) {
    const prev = staff;
    setStaff((list) =>
      list.map((s) => (s.id === member.id ? { ...s, active: !s.active } : s)),
    );
    try {
      await updateStaff(member.id, { active: !member.active });
    } catch (err: unknown) {
      setStaff(prev);
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      toast.error(message);
    }
  }

  async function handleDelete(member: Staff) {
    const prev = staff;
    setStaff((list) => list.filter((s) => s.id !== member.id)); // optimista
    try {
      await deleteStaff(member.id);
      toast.success('Miembro eliminado.');
    } catch (err: unknown) {
      setStaff(prev); // revertir
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= staff.length) return;
    const prev = staff;
    const next = [...staff];
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setStaff(next); // optimista
    try {
      await reorderStaff(next.map((s) => s.id));
    } catch (err: unknown) {
      setStaff(prev); // revertir
      const message = err instanceof Error ? err.message : 'Error al reordenar.';
      toast.error(message);
    }
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para gestionar el equipo. Encontrarás los pasos en SETUP.md."
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
        title="No se pudo cargar el equipo"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';

  const columns: Column<Staff>[] = [
    {
      key: 'order',
      header: 'Orden',
      width: 'w-24',
      cell: (row) => {
        const index = staff.findIndex((s) => s.id === row.id);
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
              disabled={index >= staff.length - 1}
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
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      cell: (row) => row.role,
    },
    {
      key: 'active',
      header: 'Estado',
      cell: (row) => (
        <Button
          variant={row.active ? 'gold' : 'secondary'}
          size="sm"
          onClick={() => void toggleActive(row)}
        >
          {row.active ? 'Activo' : 'Inactivo'}
        </Button>
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
            question="¿Eliminar este miembro?"
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-burgundy">Equipo</h1>
          <p className="mt-1 font-sans text-sm text-gris">
            Gestiona a las especialistas del estudio.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Nuevo miembro
        </Button>
      </div>

      <Table
        columns={columns}
        rows={staff}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin miembros"
        emptyDescription="Crea el primer miembro del equipo."
        emptyAction={
          <Button variant="primary" onClick={openCreate}>
            Nuevo miembro
          </Button>
        }
      />

      <Drawer
        open={drawerOpen}
        title={editingId ? 'Editar miembro' : 'Nuevo miembro'}
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDrawer} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              loading={saving}
            >
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
            placeholder="Especialista en uñas"
            value={form.role}
            error={errors.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          />
          <label className="flex items-center gap-2.5 font-sans text-sm text-burgundy-dark">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gris-light text-burgundy focus:ring-gold/40"
            />
            Miembro activo
          </label>
        </div>
      </Drawer>
    </div>
  );
}
