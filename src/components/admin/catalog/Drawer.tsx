/**
 * Sherry Studio — Slide-over (drawer) lateral para crear/editar registros.
 *
 * Patrón de registro de producto: NO es un modal centrado. Se desliza desde la
 * derecha sobre un velo tenue, con cabecera (título) y cuerpo desplazable. Se
 * cierra con Escape, clic en el velo o el botón de cerrar. Pensado para
 * reutilizarse en los módulos de catálogo y contenido.
 */
import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Pie opcional fijo (acciones del formulario). */
  footer?: ReactNode;
}

export default function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-burgundy-dark/30"
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-bone-dark bg-bone shadow-xl">
        <header className="flex items-center justify-between border-b border-bone-dark px-6 py-4">
          <h2 className="font-serif text-lg text-burgundy">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="rounded-lg p-1.5 font-sans text-sm text-gris transition-colors hover:bg-burgundy/5 hover:text-burgundy"
          >
            Cerrar
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-bone-dark px-6 py-4">{footer}</footer>
        )}
      </div>
    </div>
  );
}
