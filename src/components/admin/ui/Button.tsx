/**
 * Sherry Studio — Botón base del admin.
 *
 * Variantes: primary (burgundy), secondary (outline), gold, ghost, danger.
 * Tamaños sm/md/lg. Estado de carga con spinner accesible y disabled.
 * Pensado para reutilizarse en TODOS los módulos del panel.
 */
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'gold'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra spinner y deshabilita la interacción. */
  loading?: boolean;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bone disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-burgundy text-bone hover:bg-burgundy-light active:bg-burgundy-dark',
  secondary:
    'border border-gris-light bg-transparent text-burgundy hover:bg-burgundy/5 active:bg-burgundy/10',
  gold: 'bg-gold text-burgundy-dark hover:bg-gold-dark hover:text-bone active:bg-gold-dark',
  ghost: 'bg-transparent text-burgundy hover:bg-burgundy/5 active:bg-burgundy/10',
  danger:
    'bg-transparent border border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-bone active:bg-burgundy-dark',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const SPINNER_SIZE: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    disabled,
    className = '',
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${
        block ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className={`${SPINNER_SIZE[size]} animate-spin rounded-full border-2 border-current/30 border-t-current`}
        />
      )}
      {children}
    </button>
  );
});

export default Button;
