/**
 * Sherry Studio — Utilidades de fecha/hora (puras, sin dependencias).
 *
 * Los inputs HTML `datetime-local`, `date` y `time` trabajan en HORA LOCAL del
 * navegador sin zona. Estas funciones convierten entre ese valor local y un ISO
 * absoluto (UTC) para guardar en Supabase, y de vuelta para pintar en la UI.
 */

/** Rellena con cero a la izquierda a 2 dígitos. */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Convierte el valor de un input `datetime-local` (ej. "2026-06-01T14:30",
 * interpretado en hora local) a ISO absoluto (UTC). Lanza si es inválido.
 */
export function localInputToIso(value: string): string {
  if (!value) throw new Error('Fecha y hora requeridas.');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha y hora invalidas.');
  }
  return date.toISOString();
}

/**
 * Combina un valor de input `date` (YYYY-MM-DD) y uno `time` (HH:MM), ambos en
 * hora local, en un ISO absoluto (UTC).
 */
export function dateAndTimeToIso(dateValue: string, timeValue: string): string {
  if (!dateValue || !timeValue) throw new Error('Fecha y hora requeridas.');
  return localInputToIso(`${dateValue}T${timeValue}`);
}

/**
 * Convierte un ISO absoluto al valor que espera un input `datetime-local`
 * (YYYY-MM-DDTHH:MM en hora local del navegador).
 */
export function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Devuelve el inicio del día local (00:00) de la fecha dada. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** Devuelve el lunes (inicio de semana) del día dado, a las 00:00 locales. */
export function startOfWeek(d: Date): Date {
  const day = startOfDay(d);
  const weekday = (day.getDay() + 6) % 7; // 0 = lunes
  day.setDate(day.getDate() - weekday);
  return day;
}

/** Suma días a una fecha (nueva instancia). */
export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Formatea la hora local como "HH:MM". */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Formatea fecha local larga, ej. "lunes 1 de junio". */
export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Formatea fecha+hora local legible, ej. "1 jun 2026, 14:30". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
