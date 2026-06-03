/**
 * Sherry — Formulario publico de reserva online (React island).
 *
 * Dialogo centrado (la UNICA superposicion aceptada en la landing), con estetica
 * de marca: bone / burgundy / gold, titulares Playfair, cuerpo garamond, labels
 * Montserrat. Se abre al escuchar el evento global `sherry:book` (lo dispara
 * BookingMount sobre los CTAs con [data-booking]). Inserta una solicitud anon
 * via createOnlineBooking; si Supabase no esta configurado o falla, ofrece un
 * enlace de WhatsApp como alternativa. Incluye honeypot anti-spam.
 */
import { useEffect, useState } from 'react';
import { createOnlineBooking, listPublicServices } from '../../lib/db/appointments';
import { computeEndAt } from '../../lib/db/appointments';
import { dateAndTimeToIso } from '../../lib/datetime';
import type { Service } from '../../lib/types';

interface BookingDialogProps {
  /** Numero WhatsApp (con o sin formato) para el fallback. */
  whatsapp?: string;
}

interface FormState {
  name: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
  /** Honeypot: debe quedar vacio. */
  company: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  serviceId: '',
  date: '',
  time: '',
  notes: '',
  company: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

const LABEL =
  'block font-sans text-[11px] tracking-[0.15em] uppercase text-burgundy mb-1.5';
const CONTROL =
  'w-full border border-gold/40 bg-bone px-4 py-3 font-garamond text-base text-burgundy-dark placeholder:text-gris-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40';

export default function BookingDialog({ whatsapp = '' }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fieldErr, setFieldErr] = useState<string>('');

  const waDigits = whatsapp.replace(/\D/g, '');
  const waHref = waDigits ? `https://wa.me/${waDigits}` : 'https://wa.me/';

  // Escucha el evento global de apertura disparado por los CTAs.
  useEffect(() => {
    function onBook() {
      setOpen(true);
    }
    window.addEventListener('sherry:book', onBook);
    return () => window.removeEventListener('sherry:book', onBook);
  }, []);

  // Carga de servicios la primera vez que se abre.
  useEffect(() => {
    if (!open || services.length > 0) return;
    let active = true;
    listPublicServices()
      .then((rows) => {
        if (active) setServices(rows);
      })
      .catch(() => {
        /* Sin servicios: el select queda vacio, el usuario puede usar WhatsApp. */
      });
  }, [open, services.length]);

  // Bloquea scroll del fondo mientras esta abierto + cierre con Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    // Reinicia tras cerrar para una proxima apertura limpia (salvo exito visible).
    if (status === 'success') {
      setForm(EMPTY_FORM);
      setStatus('idle');
    }
    setFieldErr('');
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): string {
    if (!form.name.trim()) return 'Escribe tu nombre.';
    if (!form.phone.trim()) return 'Escribe tu WhatsApp.';
    if (!form.serviceId) return 'Elige un servicio.';
    if (!form.date || !form.time) return 'Indica fecha y hora preferida.';
    const start = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(start.getTime())) return 'Fecha y hora no validas.';
    if (start.getTime() <= Date.now()) return 'Elige una fecha futura.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Honeypot: si el campo oculto trae valor, es un bot. Fingimos exito y salimos.
    if (form.company.trim()) {
      setStatus('success');
      return;
    }
    const err = validate();
    if (err) {
      setFieldErr(err);
      return;
    }
    setFieldErr('');

    const svc = services.find((s) => s.id === form.serviceId);
    const startAt = dateAndTimeToIso(form.date, form.time);
    const endAt = computeEndAt(startAt, svc?.durationMin ?? 60);

    setStatus('submitting');
    try {
      await createOnlineBooking({
        clientName: form.name.trim(),
        clientPhone: form.phone.trim(),
        serviceId: svc?.id ?? null,
        serviceName: svc?.name ?? 'Por confirmar',
        startAt,
        endAt,
        notes: form.notes.trim() || null,
      });
      setStatus('success');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'No pudimos enviar tu solicitud en este momento.';
      setErrorMsg(message);
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Reservar tu ritual"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-burgundy-dark/60"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border border-gold/30 bg-bone shadow-2xl">
        <header className="flex items-start justify-between border-b border-gold/20 px-6 py-5 sm:px-8">
          <div>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-gold">
              Sherry · Zapopan
            </p>
            <h2 className="mt-1 font-serif text-2xl text-burgundy">Reserva tu ritual</h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="font-sans text-xs tracking-widest uppercase text-gris transition-colors hover:text-burgundy"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {status === 'success' ? (
            <div className="py-6 text-center">
              <h3 className="font-serif text-xl text-burgundy">Recibimos tu solicitud</h3>
              <p className="mt-3 font-garamond text-base text-gris">
                Te confirmamos por WhatsApp muy pronto. Gracias por elegir Sherry.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 inline-block bg-burgundy px-8 py-3 font-sans text-xs tracking-widest uppercase text-bone transition-colors hover:bg-burgundy-light"
              >
                Listo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot anti-spam: oculto a usuarios reales. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
                <label htmlFor="booking-company">No completar</label>
                <input
                  id="booking-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="booking-name">
                  Nombre
                </label>
                <input
                  id="booking-name"
                  type="text"
                  className={CONTROL}
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="booking-phone">
                  WhatsApp
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  className={CONTROL}
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="33 1234 5678"
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="booking-service">
                  Servicio
                </label>
                <select
                  id="booking-service"
                  className={CONTROL}
                  value={form.serviceId}
                  onChange={(e) => update('serviceId', e.target.value)}
                >
                  <option value="">Elige un servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} htmlFor="booking-date">
                    Fecha
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    className={CONTROL}
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="booking-time">
                    Hora
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    className={CONTROL}
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL} htmlFor="booking-notes">
                  Notas (opcional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={3}
                  className={`${CONTROL} resize-y`}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Cuentanos cualquier detalle"
                />
              </div>

              {fieldErr && (
                <p role="alert" className="font-garamond text-sm text-burgundy">
                  {fieldErr}
                </p>
              )}

              {status === 'error' && (
                <div className="border border-gold/30 bg-bone-light px-4 py-3">
                  <p className="font-garamond text-sm text-burgundy">{errorMsg}</p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-sans text-xs tracking-widest uppercase text-gold underline underline-offset-4 hover:text-gold-dark"
                  >
                    Reservar por WhatsApp
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-burgundy px-8 py-3.5 font-sans text-xs tracking-widest uppercase text-bone transition-colors hover:bg-burgundy-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Enviando...' : 'Enviar solicitud'}
              </button>

              <p className="text-center font-garamond text-sm text-gris-light">
                Tambien puedes{' '}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy-light"
                >
                  escribirnos por WhatsApp
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
