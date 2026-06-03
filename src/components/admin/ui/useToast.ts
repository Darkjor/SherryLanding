/**
 * Sherry Studio — Contexto + hook de toasts.
 *
 * `useToast()` expone `toast.success/error/info`. El provider vive en
 * `Toast.tsx` (ToastProvider) y renderiza la región de avisos. Separado del
 * componente para mantener el contrato del hook estable y fácil de importar.
 */
import { createContext, useContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  message: string;
}

export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/**
 * Devuelve la API de toasts. Lanza si se usa fuera de <ToastProvider>, lo cual
 * indica un error de integración del módulo (no debe ocurrir en runtime).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  }
  return ctx;
}
