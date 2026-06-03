/**
 * Sherry Studio — Repositorio tipado de VENTAS (POS manual).
 *
 * Capa fina sobre las tablas `sales` y `sale_items` de Supabase. Registra
 * ventas manuales (no procesa tarjetas): líneas, propina, método de pago y
 * total calculado. Mapea snake_case (DB) a camelCase (`Sale`/`SaleItem` en
 * types.ts) y viceversa. Toda llamada está protegida por `assertSupabase()`,
 * que lanza un error legible si Supabase no está configurado.
 */
import { assertSupabase } from '../supabase';
import type { Sale, SaleItem, PaymentMethod } from '../types';

/** Fila de la tabla `sales` tal como la devuelve Supabase. */
interface SaleRow {
  id: string;
  appointment_id: string | null;
  client_id: string | null;
  tip: number;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
}

/** Fila de la tabla `sale_items` tal como la devuelve Supabase. */
interface SaleItemRow {
  id: string;
  sale_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

/** Una línea de venta antes de persistirse (sin ids). */
export interface SaleItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

/** Datos para registrar una venta. El total se calcula en createSale. */
export interface SaleInput {
  items: SaleItemInput[];
  tip: number;
  paymentMethod: PaymentMethod;
  appointmentId?: string | null;
  clientId?: string | null;
}

/** Rango de fechas (ISO) opcional para acotar el listado. */
export interface SalesRange {
  from?: string;
  to?: string;
}

function rowToSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: row.id,
    saleId: row.sale_id,
    description: row.description,
    quantity: Number(row.quantity) || 0,
    unitPrice: Number(row.unit_price) || 0,
  };
}

function rowToSale(row: SaleRow, items: SaleItem[]): Sale {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    clientId: row.client_id,
    items,
    tip: Number(row.tip) || 0,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}

/** Suma de líneas (cantidad * precio unitario), sin propina. */
function itemsSubtotal(items: SaleItemInput[]): number {
  return items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0,
  );
}

/**
 * Lista las ventas (más recientes primero) con sus líneas, acotando por rango
 * de fechas sobre `created_at`. Hace dos consultas (sales + sale_items) y
 * agrupa las líneas por venta en JS para mantenerlo simple.
 */
export async function listSales(range: SalesRange = {}): Promise<Sale[]> {
  const db = assertSupabase();
  let query = db
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });
  if (range.from) query = query.gte('created_at', range.from);
  if (range.to) query = query.lt('created_at', range.to);

  const { data: saleRows, error: salesError } = await query;
  if (salesError) throw new Error(salesError.message);
  const sales = (saleRows ?? []) as SaleRow[];
  if (sales.length === 0) return [];

  const ids = sales.map((s) => s.id);
  const { data: itemRows, error: itemsError } = await db
    .from('sale_items')
    .select('*')
    .in('sale_id', ids);
  if (itemsError) throw new Error(itemsError.message);

  const bySale = new Map<string, SaleItem[]>();
  for (const row of (itemRows ?? []) as SaleItemRow[]) {
    const item = rowToSaleItem(row);
    const list = bySale.get(item.saleId);
    if (list) list.push(item);
    else bySale.set(item.saleId, [item]);
  }

  return sales.map((s) => rowToSale(s, bySale.get(s.id) ?? []));
}

/** Obtiene una venta con sus líneas, o null si no existe. */
export async function getSale(id: string): Promise<Sale | null> {
  const db = assertSupabase();
  const { data: saleRow, error: saleError } = await db
    .from('sales')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (saleError) throw new Error(saleError.message);
  if (!saleRow) return null;

  const { data: itemRows, error: itemsError } = await db
    .from('sale_items')
    .select('*')
    .eq('sale_id', id);
  if (itemsError) throw new Error(itemsError.message);

  const items = ((itemRows ?? []) as SaleItemRow[]).map(rowToSaleItem);
  return rowToSale(saleRow as SaleRow, items);
}

/**
 * Registra una venta: inserta en `sales` con el total calculado
 * (subtotal de líneas + propina), luego inserta las líneas en `sale_items`
 * usando el id devuelto. Devuelve la venta completa.
 */
export async function createSale(input: SaleInput): Promise<Sale> {
  const db = assertSupabase();
  const tip = Number(input.tip) || 0;
  const total = itemsSubtotal(input.items) + tip;

  const { data: saleRow, error: saleError } = await db
    .from('sales')
    .insert({
      appointment_id: input.appointmentId ?? null,
      client_id: input.clientId ?? null,
      tip,
      total,
      payment_method: input.paymentMethod,
    })
    .select('*')
    .single();
  if (saleError) throw new Error(saleError.message);
  const sale = saleRow as SaleRow;

  if (input.items.length === 0) {
    return rowToSale(sale, []);
  }

  const itemRowsToInsert = input.items.map((it) => ({
    sale_id: sale.id,
    description: it.description.trim(),
    quantity: Number(it.quantity) || 0,
    unit_price: Number(it.unitPrice) || 0,
  }));
  const { data: insertedItems, error: itemsError } = await db
    .from('sale_items')
    .insert(itemRowsToInsert)
    .select('*');
  if (itemsError) throw new Error(itemsError.message);

  const items = ((insertedItems ?? []) as SaleItemRow[]).map(rowToSaleItem);
  return rowToSale(sale, items);
}

/** Elimina una venta. Las líneas se borran en cascada (FK on delete cascade). */
export async function deleteSale(id: string): Promise<void> {
  const db = assertSupabase();
  const { error } = await db.from('sales').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
