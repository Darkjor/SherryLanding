/**
 * Sherry Studio — Sección Contacto del editor de contenido (site_settings).
 *
 * Formulario único que edita whatsapp, email, address, instagram y la lista de
 * horarios (líneas). Resuelve los TODOs de contacto de la landing. Guarda vía
 * updateSiteSettings con feedback por toast y recordatorio de publicar.
 */
import { useEffect, useState } from 'react';
import type { SiteSettings } from '../../../../lib/types';
import { getSiteSettings, updateSiteSettings } from '../../../../lib/db/content';
import { Button, Field, EmptyState, LoadingState, useToast } from '../../ui';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

interface FormErrors {
  email?: string;
}

function validate(form: SiteSettings): FormErrors {
  const errors: FormErrors = {};
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Email no válido.';
  return errors;
}

export default function ContactoSection() {
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [form, setForm] = useState<SiteSettings>({
    whatsapp: '',
    email: '',
    address: '',
    instagram: '',
    hours: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((settings) => {
        if (!active) return;
        setForm({
          ...settings,
          hours: settings.hours.length > 0 ? settings.hours : [''],
        });
        setState({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Error al cargar.';
        setState({ kind: 'error', message });
      });
    return () => {
      active = false;
    };
  }, []);

  function setHour(index: number, value: string) {
    setForm((f) => {
      const hours = [...f.hours];
      hours[index] = value;
      return { ...f, hours };
    });
  }

  function addHour() {
    setForm((f) => ({ ...f, hours: [...f.hours, ''] }));
  }

  function removeHour(index: number) {
    setForm((f) => ({ ...f, hours: f.hours.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const saved = await updateSiteSettings(form);
      setForm({
        ...saved,
        hours: saved.hours.length > 0 ? saved.hours : [''],
      });
      toast.success('Guardado. Usa Publicar cambios para reflejarlo en el sitio.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (state.kind === 'loading') return <LoadingState />;

  if (state.kind === 'error') {
    return (
      <EmptyState
        title="No se pudo cargar"
        description={`Hubo un problema al consultar Supabase: ${state.message}`}
      />
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <Field
        label="WhatsApp"
        placeholder="+52 55 1234 5678"
        value={form.whatsapp}
        onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
      />
      <Field
        label="Email"
        type="email"
        error={errors.email}
        placeholder="hola@sherry.mx"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Field
        label="Dirección"
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
      />
      <Field
        label="Instagram"
        placeholder="@sherry.studio"
        value={form.instagram}
        onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
      />

      <div>
        <span className="mb-1.5 block font-sans text-xs font-semibold tracking-wide uppercase text-burgundy">
          Horarios
        </span>
        <div className="space-y-2">
          {form.hours.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={line}
                placeholder="Lunes a viernes: 10:00 - 19:00"
                onChange={(e) => setHour(index, e.target.value)}
                className="w-full rounded-lg border border-gris-light bg-bone px-3.5 py-2.5 font-sans text-sm text-burgundy-dark placeholder:text-gris-light focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Quitar línea"
                onClick={() => removeHour(index)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button variant="secondary" size="sm" onClick={addHour}>
            Añadir línea
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
          Guardar contacto
        </Button>
      </div>
    </div>
  );
}
