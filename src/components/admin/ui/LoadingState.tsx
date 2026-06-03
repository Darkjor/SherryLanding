/**
 * Sherry Studio — Estado de carga de marca.
 *
 * Spinner discreto con copy "Cargando…". Para regiones internas del panel
 * (no pantalla completa). Anuncia el estado con aria-live.
 */
interface LoadingStateProps {
  /** Texto bajo el spinner. */
  label?: string;
  className?: string;
}

export default function LoadingState({
  label = 'Cargando…',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold"
      />
      <p className="font-sans text-xs tracking-widest uppercase text-gris">
        {label}
      </p>
    </div>
  );
}
