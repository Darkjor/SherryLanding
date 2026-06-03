/**
 * Sherry Studio — Tarjeta de KPI.
 *
 * Restringida y tipográfica: label en mayúsculas, valor en serif, sublabel
 * opcional. Sin degradados ni números gigantes de plantilla.
 */
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Contexto bajo el valor (p.ej. "vs. mes anterior"). */
  sublabel?: string;
  /** Estado de carga: muestra un placeholder en lugar del valor. */
  loading?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  sublabel,
  loading = false,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-bone-dark bg-bone-light px-5 py-5 ${className}`}
    >
      <p className="font-sans text-xs font-semibold tracking-widest uppercase text-gris">
        {label}
      </p>
      {loading ? (
        <div
          aria-hidden="true"
          className="mt-3 h-8 w-20 animate-pulse rounded bg-bone-dark"
        />
      ) : (
        <p className="mt-2 font-serif text-3xl leading-none text-burgundy">
          {value}
        </p>
      )}
      {sublabel && !loading && (
        <p className="mt-2 font-sans text-xs text-gris">{sublabel}</p>
      )}
    </div>
  );
}
