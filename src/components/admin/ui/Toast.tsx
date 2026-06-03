/**
 * Sherry Studio — Provider + región de toasts.
 *
 * Envuelve el árbol del admin (lo hace AdminPage). Mantiene la pila de avisos,
 * los autodescarta y los renderiza en una región aria-live fija. El hook
 * `useToast` (useToast.ts) consume este contexto.
 */
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ToastContext,
  type ToastApi,
  type ToastMessage,
  type ToastVariant,
} from './useToast';

/** Tiempo en pantalla por aviso (ms). */
const TOAST_TTL = 5000;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-gold bg-bone-light text-burgundy',
  error: 'border-burgundy bg-burgundy text-bone',
  info: 'border-bone-dark bg-bone-light text-burgundy-dark',
};

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message }]);
      if (typeof window !== 'undefined') {
        window.setTimeout(() => remove(id), TOAST_TTL);
      }
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm ${
              VARIANT_STYLES[t.variant]
            }`}
          >
            <p className="font-sans text-sm">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Cerrar aviso"
              className="font-sans text-sm leading-none opacity-70 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
