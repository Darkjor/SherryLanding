/**
 * Sherry Studio — Módulo de VENTAS (POS manual).
 *
 * Registro manual de ventas (no procesa tarjetas): líneas, propina, método de
 * pago y total. Lista ventas recientes con filtro por rango de fechas y abre un
 * drawer de checkout para crear una venta, mostrando un recibo simple al
 * guardar. Tipado contra src/lib/types.ts. Estados de carga/vacío/no
 * configurado contemplados. UI sobria (sin degradados ni modales centrados).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import type { Client, PaymentMethod, Sale, Service } from '../../../lib/types';
import {
  createSale,
  deleteSale,
  listSales,
  type SaleItemInput,
} from '../../../lib/db/sales';
import { listServices } from '../../../lib/db/services';
import { listClients } from '../../../lib/db/clients';
import {
  Button,
  Table,
  Field,
  SelectField,
  ConfirmInline,
  EmptyState,
  useToast,
  type Column,
} from '../ui';
import Drawer from './Drawer';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Primer día del mes actual en YYYY-MM-DD (para inputs date). */
function monthStartInput(): string {
  const now = new Date();
  return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
}

function todayInput(): string {
  return toDateInput(new Date());
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Convierte un input date (YYYY-MM-DD) a límites ISO [inicio, finExclusivo]. */
function rangeFromInputs(from: string, to: string): { from: string; to: string } {
  const start = new Date(`${from}T00:00:00`);
  const endExclusive = new Date(`${to}T00:00:00`);
  endExclusive.setDate(endExclusive.getDate() + 1);
  return { from: start.toISOString(), to: endExclusive.toISOString() };
}

/** Extrae el límite inferior numérico de un priceRange tipo "$650 – $850". */
function parseLowerPrice(priceRange: string): number {
  const match = priceRange.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

/** Línea editable del checkout (incluye id de UI local). */
interface DraftItem {
  uid: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function newDraftItem(): DraftItem {
  return {
    uid: Math.random().toString(36).slice(2),
    description: '',
    quantity: 1,
    unitPrice: 0,
  };
}

export default function VentasModule() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [sales, setSales] = useState<Sale[]>([]);

  const [from, setFrom] = useState<string>(monthStartInput());
  const [to, setTo] = useState<string>(todayInput());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const loadSales = useCallback(async () => {
    const range = rangeFromInputs(from, to);
    const rows = await listSales(range);
    setSales(rows);
  }, [from, to]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ kind: 'unconfigured' });
      return;
    }
    let active = true;
    loadSales()
      .then(() => {
        if (active) setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Error desconocido.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [loadSales]);

  async function handleDelete(id: string) {
    const previous = sales;
    setSales((s) => s.filter((row) => row.id !== id)); // optimista
    try {
      await deleteSale(id);
      toast.success('Venta eliminada.');
    } catch (err: unknown) {
      setSales(previous); // revertir
      toast.error(
        err instanceof Error ? err.message : 'No se pudo eliminar la venta.',
      );
    }
  }

  function handleSaved(sale: Sale) {
    setSales((s) => [sale, ...s]);
    setDrawerOpen(false);
    setReceipt(sale);
    toast.success('Venta registrada.');
  }

  if (state.kind === 'unconfigured') {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para registrar ventas. Encontrarás los pasos en SETUP.md."
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudieron cargar las ventas"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
        action={
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        }
      />
    );
  }

  const loading = state.kind === 'loading';

  const columns: Column<Sale>[] = [
    {
      key: 'when',
      header: 'Fecha',
      cell: (r) => formatWhen(r.createdAt),
    },
    {
      key: 'ref',
      header: 'Referencia',
      hideOnMobile: true,
      cell: (r) =>
        r.clientId
          ? `Clienta ${r.clientId.slice(0, 8)}`
          : r.appointmentId
            ? `Cita ${r.appointmentId.slice(0, 8)}`
            : 'Venta mostrador',
    },
    {
      key: 'items',
      header: 'Líneas',
      align: 'center',
      hideOnMobile: true,
      cell: (r) => r.items.length,
    },
    {
      key: 'method',
      header: 'Pago',
      cell: (r) => (
        <span className="font-sans text-xs tracking-wide text-gris">
          {PAYMENT_LABEL[r.paymentMethod]}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      cell: (r) => (
        <span className="font-medium">{formatCurrency(r.total)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setReceipt(r)}>
            Recibo
          </Button>
          <ConfirmInline
            question="¿Eliminar esta venta?"
            confirmLabel="Eliminar"
            onConfirm={() => handleDelete(r.id)}
            trigger={(ask) => (
              <Button size="sm" variant="danger" onClick={ask}>
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field
            label="Desde"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Field
            label="Hasta"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <Button onClick={() => setDrawerOpen(true)}>Nueva venta</Button>
      </header>

      <Table
        columns={columns}
        rows={sales}
        rowKey={(r) => r.id}
        loading={loading}
        emptyTitle="Sin ventas en el periodo"
        emptyDescription="Ajusta el rango de fechas o registra una nueva venta."
        emptyAction={
          <Button onClick={() => setDrawerOpen(true)}>Nueva venta</Button>
        }
      />

      <CheckoutDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />

      {receipt && (
        <ReceiptDrawer sale={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkout (drawer)
// ---------------------------------------------------------------------------

function CheckoutDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (sale: Sale) => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState<DraftItem[]>([newDraftItem()]);
  const [tip, setTip] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [clientId, setClientId] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quickServiceId, setQuickServiceId] = useState<string>('');

  // Carga auxiliar (servicios + clientas) al abrir; guardada y tolerante.
  useEffect(() => {
    if (!open || !isSupabaseConfigured) return;
    let active = true;
    listServices()
      .then((s) => {
        if (active) setServices(s);
      })
      .catch(() => {
        /* opcional: el quick-add simplemente no aparece */
      });
    listClients()
      .then((c) => {
        if (active) setClients(c);
      })
      .catch(() => {
        /* opcional: el selector de clienta simplemente no aparece */
      });
    return () => {
      active = false;
    };
  }, [open]);

  // Reinicia el formulario cuando se cierra.
  useEffect(() => {
    if (open) return;
    setItems([newDraftItem()]);
    setTip(0);
    setPaymentMethod('cash');
    setClientId('');
    setAppointmentId('');
    setQuickServiceId('');
  }, [open]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
        0,
      ),
    [items],
  );
  const total = subtotal + (Number(tip) || 0);

  function updateItem(uid: string, patch: Partial<DraftItem>) {
    setItems((list) =>
      list.map((it) => (it.uid === uid ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(uid: string) {
    setItems((list) =>
      list.length > 1 ? list.filter((it) => it.uid !== uid) : list,
    );
  }

  function addQuickService() {
    const svc = services.find((s) => s.id === quickServiceId);
    if (!svc) return;
    const draft: DraftItem = {
      uid: Math.random().toString(36).slice(2),
      description: svc.name,
      quantity: 1,
      unitPrice: parseLowerPrice(svc.priceRange),
    };
    // Reemplaza la primera línea vacía o agrega una nueva.
    setItems((list) => {
      const emptyIndex = list.findIndex(
        (it) => !it.description.trim() && it.unitPrice === 0,
      );
      if (emptyIndex >= 0) {
        const copy = [...list];
        copy[emptyIndex] = { ...draft, uid: copy[emptyIndex]!.uid };
        return copy;
      }
      return [...list, draft];
    });
    setQuickServiceId('');
  }

  async function handleSave() {
    const cleanItems: SaleItemInput[] = items
      .map((it) => ({
        description: it.description.trim(),
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
      }))
      .filter((it) => it.description.length > 0 && it.quantity > 0);

    if (cleanItems.length === 0) {
      toast.error('Agrega al menos una línea con descripción y cantidad.');
      return;
    }

    setSaving(true);
    try {
      const sale = await createSale({
        items: cleanItems,
        tip: Number(tip) || 0,
        paymentMethod,
        clientId: clientId || null,
        appointmentId: appointmentId.trim() || null,
      });
      onSaved(sale);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo registrar la venta.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Nueva venta"
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-sans text-xs tracking-wide uppercase text-gris">
              Total
            </p>
            <p className="font-serif text-2xl text-burgundy">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Registrar venta
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Vínculos opcionales */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {clients.length > 0 ? (
            <SelectField
              label="Clienta (opcional)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Sin vincular</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          ) : (
            <Field
              label="ID de clienta (opcional)"
              value={clientId}
              placeholder="UUID de la clienta"
              onChange={(e) => setClientId(e.target.value)}
            />
          )}
          <Field
            label="ID de cita (opcional)"
            value={appointmentId}
            placeholder="UUID de la cita"
            onChange={(e) => setAppointmentId(e.target.value)}
          />
        </div>

        {/* Quick-add desde servicios */}
        {services.length > 0 && (
          <div className="flex items-end gap-2">
            <SelectField
              label="Agregar servicio"
              className="flex-1"
              value={quickServiceId}
              onChange={(e) => setQuickServiceId(e.target.value)}
            >
              <option value="">Elegir servicio…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.priceRange})
                </option>
              ))}
            </SelectField>
            <Button
              variant="gold"
              onClick={addQuickService}
              disabled={!quickServiceId}
            >
              Agregar
            </Button>
          </div>
        )}

        {/* Editor de líneas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base text-burgundy">Líneas</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setItems((l) => [...l, newDraftItem()])}
            >
              Añadir línea
            </Button>
          </div>

          {items.map((it) => (
            <div
              key={it.uid}
              className="rounded-lg border border-bone-dark bg-bone-light p-3"
            >
              <Field
                label="Descripción"
                value={it.description}
                placeholder="Servicio o producto"
                onChange={(e) =>
                  updateItem(it.uid, { description: e.target.value })
                }
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field
                  label="Cantidad"
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) =>
                    updateItem(it.uid, { quantity: Number(e.target.value) })
                  }
                />
                <Field
                  label="Precio unitario"
                  type="number"
                  min={0}
                  step="0.01"
                  value={it.unitPrice}
                  onChange={(e) =>
                    updateItem(it.uid, { unitPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-sans text-xs text-gris">
                  Subtotal{' '}
                  {formatCurrency(
                    (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
                  )}
                </span>
                {items.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(it.uid)}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Propina + método */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Propina"
            type="number"
            min={0}
            step="0.01"
            value={tip}
            onChange={(e) => setTip(Number(e.target.value))}
          />
          <SelectField
            label="Método de pago"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as PaymentMethod)
            }
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </SelectField>
        </div>

        <div className="rounded-lg border border-bone-dark bg-bone-light px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gris">Subtotal</span>
            <span className="text-burgundy-dark">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-gris">Propina</span>
            <span className="text-burgundy-dark">
              {formatCurrency(Number(tip) || 0)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-bone-dark pt-2 font-medium">
            <span className="text-burgundy">Total</span>
            <span className="text-burgundy">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Recibo (drawer)
// ---------------------------------------------------------------------------

function ReceiptDrawer({
  sale,
  onClose,
}: {
  sale: Sale;
  onClose: () => void;
}) {
  const subtotal = sale.total - sale.tip;
  return (
    <Drawer
      open
      onClose={onClose}
      title="Recibo de venta"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={() => window.print()}>Imprimir</Button>
        </div>
      }
    >
      <div className="space-y-5 font-sans text-sm text-burgundy-dark">
        <div>
          <p className="font-serif text-lg text-burgundy">Sherry Studio</p>
          <p className="text-xs text-gris">{formatWhen(sale.createdAt)}</p>
          <p className="text-xs text-gris">
            Pago: {PAYMENT_LABEL[sale.paymentMethod]}
          </p>
        </div>

        <div className="rounded-lg border border-bone-dark bg-bone-light">
          <div className="divide-y divide-bone-dark/60">
            {sale.items.map((it) => (
              <div
                key={it.id}
                className="flex items-start justify-between px-4 py-3"
              >
                <div>
                  <p className="text-burgundy-dark">{it.description}</p>
                  <p className="text-xs text-gris">
                    {it.quantity} x {formatCurrency(it.unitPrice)}
                  </p>
                </div>
                <span className="text-burgundy-dark">
                  {formatCurrency(it.quantity * it.unitPrice)}
                </span>
              </div>
            ))}
            {sale.items.length === 0 && (
              <p className="px-4 py-3 text-xs text-gris">Sin líneas.</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gris">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gris">Propina</span>
            <span>{formatCurrency(sale.tip)}</span>
          </div>
          <div className="flex justify-between border-t border-bone-dark pt-2 font-medium text-burgundy">
            <span>Total</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
