/**
 * Sherry Studio — Módulo de CONTENIDO de la landing.
 *
 * Editor por pestañas (in-page, sin rutas): Testimonios, FAQ, Gestos,
 * Filosofía y Contacto. Cada sección reutiliza las primitivas de UI, el drawer
 * lateral y la confirmación inline. Tras guardar, recuerda usar "Publicar
 * cambios" (la landing lee en build). Estados de carga / vacío / "Supabase no
 * configurado" contemplados; toda llamada está protegida.
 */
import { useState } from 'react';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { EmptyState } from '../ui';
import TestimoniosSection from './sections/TestimoniosSection';
import FaqSection from './sections/FaqSection';
import GestosSection from './sections/GestosSection';
import FilosofiaSection from './sections/FilosofiaSection';
import ContactoSection from './sections/ContactoSection';

const SETUP_HREF = `${import.meta.env.BASE_URL}../SETUP.md`;

type TabKey =
  | 'testimonios'
  | 'faq'
  | 'gestos'
  | 'filosofia'
  | 'contacto';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'testimonios', label: 'Testimonios' },
  { key: 'faq', label: 'FAQ' },
  { key: 'gestos', label: 'Gestos' },
  { key: 'filosofia', label: 'Filosofía' },
  { key: 'contacto', label: 'Contacto' },
];

export default function ContenidoModule() {
  const [tab, setTab] = useState<TabKey>('testimonios');

  if (!isSupabaseConfigured) {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta tu base de datos para editar el contenido de la landing. Encontrarás los pasos en SETUP.md."
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Contenido</h1>
        <p className="mt-1 font-sans text-sm text-gris">
          Edita lo que se muestra en la landing. Recuerda publicar para reflejar
          los cambios.
        </p>
      </div>

      <nav
        aria-label="Secciones de contenido"
        className="flex flex-wrap gap-1 border-b border-bone-dark"
      >
        {TABS.map((t) => {
          const activeTab = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={activeTab ? 'page' : undefined}
              className={`-mb-px border-b-2 px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                activeTab
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-gris hover:text-burgundy'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div>
        {tab === 'testimonios' && <TestimoniosSection />}
        {tab === 'faq' && <FaqSection />}
        {tab === 'gestos' && <GestosSection />}
        {tab === 'filosofia' && <FilosofiaSection />}
        {tab === 'contacto' && <ContactoSection />}
      </div>
    </div>
  );
}
