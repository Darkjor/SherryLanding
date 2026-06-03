/**
 * Sherry Studio — Módulo de MEMBRESÍAS.
 *
 * Dos áreas en pestañas internas:
 *  - Planes: CRUD de membership_plans (name, price, active) en drawer lateral.
 *  - Miembros: lista (clienta + plan + estado), alta eligiendo clienta + plan,
 *    cambio de estado y borrado.
 * Actualizaciones optimistas con feedback por toast. Estados de carga / vacío /
 * "Supabase no configurado". Tipado contra src/lib/types.ts.
 */
import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import type { Client, Member, MembershipPlan } from '../../../lib/types';
import {
  createPlan,
  deletePlan,
  updatePlan,
  listMembershipPlans,
  listMembers,
  createMember,
  updateMemberStatus,
  deleteMember,
  type PlanInput,
  type MemberWithNames,
} from '../../../lib/db/members';
import { listClients } from '../../../lib/db/clients';
import {
  Button,
  Table,
  Field,
  SelectField,
  ConfirmInline,
  EmptyState,
  StatCard,
  useToast,
  type Column,
} from '../ui';
import Drawer from './Drawer';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

type MemberStatus = Member['status'];

const MEMBER_STATUS: { value: MemberStatus; label: string }[] = [
  { value: 'active', label: 'Activa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'cancelled', label: 'Cancelada' },
];

type Tab = 'planes' | 'miembros';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

function formatPrice(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

// ---------------------------------------------------------------------------

interface PlanFormState {
  name: string;
  price: string;
  active: boolean;
}

const EMPTY_PLAN_FORM: PlanFormState = { name: '', price: '', active: true };

interface MemberFormState {
  clientId: string;
  planId: string;
  status: MemberStatus;
}

export default function MembresiasModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [tab, setTab] = useState<Tab>('planes');

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<MemberWithNames[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Drawer de planes.
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormState>(EMPTY_PLAN_FORM);
  const [planErrors, setPlanErrors] = useState<{ name?: string; price?: string }>(
    {},
  );
  const [savingPlan, setSavingPlan] = useState(false);

  // Drawer de miembros.
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormState>({
    clientId: '',
    planId: '',
    status: 'active',
  });
  const [memberErrors, setMemberErrors] = useState<{
    clientId?: string;
    planId?: string;
  }>({});
  const [savingMember, setSavingMember] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    Promise.all([listMembershipPlans(), listMembers(), listClients()])
      .then(([planRows, memberRows, clientRows]) => {
        if (!active) return;
        setPlans(planRows);
        setMembers(memberRows);
        setClients(clientRows);
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

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'active').length,
    [members],
  );
  const pausedMembers = useMemo(
    () => members.filter((m) => m.status === 'paused').length,
    [members],
  );
  const activePlans = useMemo(
    () => plans.filter((p) => p.active).length,
    [plans],
  );

  // ----- Planes -----------------------------------------------------------

  function openCreatePlan() {
    setEditingPlanId(null);
    setPlanForm(EMPTY_PLAN_FORM);
    setPlanErrors({});
    setPlanDrawerOpen(true);
  }

  function openEditPlan(plan: MembershipPlan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      price: String(plan.price),
      active: plan.active,
    });
    setPlanErrors({});
    setPlanDrawerOpen(true);
  }

  function closePlanDrawer() {
    if (savingPlan) return;
    setPlanDrawerOpen(false);
  }

  async function handleSavePlan() {
    const errors: { name?: string; price?: string } = {};
    if (!planForm.name.trim()) errors.name = 'El nombre es obligatorio.';
    const price = Number(planForm.price);
    if (!Number.isFinite(price) || price < 0)
      errors.price = 'El precio debe ser un número válido.';
    setPlanErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const input: PlanInput = {
      name: planForm.name.trim(),
      price,
      active: planForm.active,
    };

    setSavingPlan(true);
    try {
      if (editingPlanId) {
        const updated = await updatePlan(editingPlanId, input);
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlanId ? updated : p)),
        );
        toast.success('Plan actualizado.');
      } else {
        const created = await createPlan(input);
        setPlans((prev) => [...prev, created]);
        toast.success('Plan creado.');
      }
      setPlanDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSavingPlan(false);
    }
  }

  async function togglePlanActive(plan: MembershipPlan) {
    const prev = plans;
    setPlans((list) =>
      list.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p)),
    );
    try {
      await updatePlan(plan.id, { active: !plan.active });
    } catch (err: unknown) {
      setPlans(prev);
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      toast.error(message);
    }
  }

  async function handleDeletePlan(plan: MembershipPlan) {
    const prev = plans;
    setPlans((list) => list.filter((p) => p.id !== plan.id));
    try {
      await deletePlan(plan.id);
      toast.success('Plan eliminado.');
    } catch (err: unknown) {
      setPlans(prev);
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  // ----- Miembros ---------------------------------------------------------

  function openCreateMember() {
    setMemberForm({ clientId: '', planId: '', status: 'active' });
    setMemberErrors({});
    setMemberDrawerOpen(true);
  }

  function closeMemberDrawer() {
    if (savingMember) return;
    setMemberDrawerOpen(false);
  }

  async function handleSaveMember() {
    const errors: { clientId?: string; planId?: string } = {};
    if (!memberForm.clientId) errors.clientId = 'Elige una clienta.';
    if (!memberForm.planId) errors.planId = 'Elige un plan.';
    setMemberErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingMember(true);
    try {
      const created = await createMember({
        clientId: memberForm.clientId,
        planId: memberForm.planId,
        status: memberForm.status,
      });
      const client = clients.find((c) => c.id === created.clientId);
      const plan = plans.find((p) => p.id === created.planId);
      const enriched: MemberWithNames = {
        ...created,
        clientName: client?.name ?? 'Clienta',
        planName: plan?.name ?? 'Plan',
      };
      setMembers((prev) => [enriched, ...prev]);
      toast.success('Miembro agregado.');
      setMemberDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSavingMember(false);
    }
  }

  async function changeMemberStatus(member: MemberWithNames, status: MemberStatus) {
    if (member.status === status) return;
    const prev = members;
    setMembers((list) =>
      list.map((m) => (m.id === member.id ? { ...m, status } : m)),
    );
    try {
      await updateMemberStatus(member.id, status);
    } catch (err: unknown) {
      setMembers(prev);
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      toast.error(message);
    }
  }

  async function handleDeleteMember(member: MemberWithNames) {
    const prev = members;
    setMembers((list) => list.filter((m) => m.id !== member.id));
    try {
      await deleteMember(member.id);
      toast.success('Miembro eliminado.');
    } catch (err: unknown) {
      setMembers(prev);
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      toast.error(message);
    }
  }

  // ----- Estados globales -------------------------------------------------

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para gestionar membresías. Encontrarás los pasos en SETUP.md."
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
        title="No se pudieron cargar las membresías"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  const loading = state.kind === 'loading';

  const planColumns: Column<MembershipPlan>[] = [
    {
      key: 'name',
      header: 'Plan',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'price',
      header: 'Precio',
      cell: (row) => formatPrice(row.price),
    },
    {
      key: 'active',
      header: 'Estado',
      cell: (row) => (
        <Button
          variant={row.active ? 'gold' : 'secondary'}
          size="sm"
          onClick={() => void togglePlanActive(row)}
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
          <Button variant="secondary" size="sm" onClick={() => openEditPlan(row)}>
            Editar
          </Button>
          <ConfirmInline
            question="¿Eliminar este plan?"
            confirmLabel="Eliminar"
            onConfirm={() => handleDeletePlan(row)}
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

  const memberColumns: Column<MemberWithNames>[] = [
    {
      key: 'client',
      header: 'Clienta',
      cell: (row) => <span className="font-medium">{row.clientName}</span>,
    },
    {
      key: 'plan',
      header: 'Plan',
      cell: (row) => row.planName,
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (row) => (
        <SelectField
          label=""
          aria-label="Estado del miembro"
          value={row.status}
          onChange={(e) =>
            void changeMemberStatus(row, e.target.value as MemberStatus)
          }
        >
          {MEMBER_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <ConfirmInline
          question="¿Eliminar este miembro?"
          confirmLabel="Eliminar"
          onConfirm={() => handleDeleteMember(row)}
          trigger={(ask) => (
            <Button variant="danger" size="sm" onClick={ask}>
              Eliminar
            </Button>
          )}
        />
      ),
    },
  ];

  const tabButton = (key: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`border-b-2 px-1 pb-2 font-sans text-sm font-semibold tracking-wide transition-colors ${
        tab === key
          ? 'border-burgundy text-burgundy'
          : 'border-transparent text-gris hover:text-burgundy'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Membresías</h1>
        <p className="mt-1 font-sans text-sm text-gris">
          Planes vendibles y miembros activos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Miembros activos" value={activeMembers} loading={loading} />
        <StatCard label="Miembros pausados" value={pausedMembers} loading={loading} />
        <StatCard label="Planes activos" value={activePlans} loading={loading} />
      </div>

      <div className="flex gap-6 border-b border-bone-dark">
        {tabButton('planes', 'Planes')}
        {tabButton('miembros', 'Miembros')}
      </div>

      {tab === 'planes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={openCreatePlan}>
              Nuevo plan
            </Button>
          </div>
          <Table
            columns={planColumns}
            rows={plans}
            rowKey={(r) => r.id}
            loading={loading}
            emptyTitle="Sin planes"
            emptyDescription="Crea el primer plan de membresía."
            emptyAction={
              <Button variant="primary" onClick={openCreatePlan}>
                Nuevo plan
              </Button>
            }
          />
        </div>
      )}

      {tab === 'miembros' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={openCreateMember}
              disabled={clients.length === 0 || plans.length === 0}
            >
              Nuevo miembro
            </Button>
          </div>
          {clients.length === 0 || plans.length === 0 ? (
            <EmptyState
              title="Falta configuración"
              description="Necesitas al menos una clienta y un plan para registrar miembros."
            />
          ) : (
            <Table
              columns={memberColumns}
              rows={members}
              rowKey={(r) => r.id}
              loading={loading}
              emptyTitle="Sin miembros"
              emptyDescription="Agrega el primer miembro eligiendo una clienta y un plan."
              emptyAction={
                <Button variant="primary" onClick={openCreateMember}>
                  Nuevo miembro
                </Button>
              }
            />
          )}
        </div>
      )}

      <Drawer
        open={planDrawerOpen}
        title={editingPlanId ? 'Editar plan' : 'Nuevo plan'}
        onClose={closePlanDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closePlanDrawer} disabled={savingPlan}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSavePlan()}
              loading={savingPlan}
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
            value={planForm.name}
            error={planErrors.name}
            onChange={(e) =>
              setPlanForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Field
            label="Precio (MXN)"
            required
            type="number"
            min={0}
            value={planForm.price}
            error={planErrors.price}
            onChange={(e) =>
              setPlanForm((f) => ({ ...f, price: e.target.value }))
            }
          />
          <label className="flex items-center gap-2.5 font-sans text-sm text-burgundy-dark">
            <input
              type="checkbox"
              checked={planForm.active}
              onChange={(e) =>
                setPlanForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gris-light text-burgundy focus:ring-gold/40"
            />
            Plan activo
          </label>
        </div>
      </Drawer>

      <Drawer
        open={memberDrawerOpen}
        title="Nuevo miembro"
        onClose={closeMemberDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={closeMemberDrawer}
              disabled={savingMember}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSaveMember()}
              loading={savingMember}
            >
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectField
            label="Clienta"
            required
            value={memberForm.clientId}
            error={memberErrors.clientId}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, clientId: e.target.value }))
            }
          >
            <option value="">Selecciona una clienta</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Plan"
            required
            value={memberForm.planId}
            error={memberErrors.planId}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, planId: e.target.value }))
            }
          >
            <option value="">Selecciona un plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Estado"
            value={memberForm.status}
            onChange={(e) =>
              setMemberForm((f) => ({
                ...f,
                status: e.target.value as MemberStatus,
              }))
            }
          >
            {MEMBER_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectField>
        </div>
      </Drawer>
    </div>
  );
}
