/**
 * Sherry Studio — Confirmación inline para acciones destructivas.
 *
 * NO es un modal: el disparador se reemplaza en su sitio por una pregunta con
 * "Confirmar / Cancelar". Patrón recomendado del panel para borrados.
 *
 * Uso:
 *   <ConfirmInline
 *     trigger={(ask) => <Button variant="danger" size="sm" onClick={ask}>Eliminar</Button>}
 *     question="¿Eliminar esta clienta?"
 *     confirmLabel="Eliminar"
 *     onConfirm={handleDelete}
 *   />
 */
import { useState, type ReactNode } from 'react';
import Button from './Button';

interface ConfirmInlineProps {
  /** Renderiza el disparador; recibe la función que abre la confirmación. */
  trigger: (ask: () => void) => ReactNode;
  question: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Acción a ejecutar al confirmar. Puede ser async; muestra loading. */
  onConfirm: () => void | Promise<void>;
  className?: string;
}

export default function ConfirmInline({
  trigger,
  question,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  className = '',
}: ConfirmInlineProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <>{trigger(() => setOpen(true))}</>;
  }

  return (
    <div
      role="group"
      aria-label={question}
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg border border-burgundy/30 bg-burgundy/5 px-3 py-1.5 ${className}`}
    >
      <span className="font-sans text-xs text-burgundy">{question}</span>
      <Button
        variant="danger"
        size="sm"
        loading={busy}
        onClick={handleConfirm}
      >
        {confirmLabel}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => setOpen(false)}
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
