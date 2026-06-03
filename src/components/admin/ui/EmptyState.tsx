/**
 * Sherry Studio — Estado vacío.
 *
 * Sin iconos: título + descripción + acción opcional. Composición tipográfica
 * sobria, pensada para tablas vacías y módulos en construcción.
 */
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Acción opcional (p.ej. un <Button> para crear el primer registro). */
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-bone-dark bg-bone-light/60 px-6 py-12 text-center ${className}`}
    >
      <h3 className="font-serif text-lg text-burgundy">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-gris">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
