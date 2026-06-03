/**
 * Sherry Studio — Campos de formulario etiquetados.
 *
 * Tres wrappers (input/textarea/select) que comparten label, texto de ayuda,
 * texto de error y `aria-invalid`. Generan un id estable si no se pasa uno,
 * y enlazan label/help/error vía aria-describedby. Sin `any`.
 */
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

interface BaseFieldProps {
  label: string;
  /** Texto de ayuda bajo el campo (oculto si hay error). */
  help?: string;
  /** Mensaje de error; activa aria-invalid y estilo de error. */
  error?: string;
  /** Marca visual de campo obligatorio. */
  required?: boolean;
  className?: string;
}

const LABEL_CLASS =
  'mb-1.5 block font-sans text-xs font-semibold tracking-wide uppercase text-burgundy';
const CONTROL_BASE =
  'w-full rounded-lg border bg-bone px-3.5 py-2.5 font-sans text-sm text-burgundy-dark placeholder:text-gris-light focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60';

function controlClasses(hasError: boolean, extra = ''): string {
  const border = hasError
    ? 'border-burgundy focus:border-burgundy'
    : 'border-gris-light focus:border-gold';
  return `${CONTROL_BASE} ${border} ${extra}`;
}

function Messages({
  help,
  error,
  helpId,
  errorId,
}: {
  help?: string;
  error?: string;
  helpId: string;
  errorId: string;
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="mt-1.5 font-sans text-xs text-burgundy">
        {error}
      </p>
    );
  }
  if (help) {
    return (
      <p id={helpId} className="mt-1.5 font-sans text-xs text-gris">
        {help}
      </p>
    );
  }
  return null;
}

/** Construye la lista de ids para aria-describedby. */
function describedBy(
  hasError: boolean,
  hasHelp: boolean,
  helpId: string,
  errorId: string,
): string | undefined {
  if (hasError) return errorId;
  if (hasHelp) return helpId;
  return undefined;
}

// ---------------------------------------------------------------------------

export interface FieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, help, error, required, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={className}>
      <label htmlFor={fieldId} className={LABEL_CLASS}>
        {label}
        {required && <span className="ml-0.5 text-burgundy" aria-hidden="true">*</span>}
      </label>
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(hasError, Boolean(help), helpId, errorId)}
        className={controlClasses(hasError)}
        {...rest}
      />
      <Messages help={help} error={error} helpId={helpId} errorId={errorId} />
    </div>
  );
});

// ---------------------------------------------------------------------------

export interface TextareaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { label, help, error, required, id, className, rows = 4, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={className}>
      <label htmlFor={fieldId} className={LABEL_CLASS}>
        {label}
        {required && <span className="ml-0.5 text-burgundy" aria-hidden="true">*</span>}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(hasError, Boolean(help), helpId, errorId)}
        className={controlClasses(hasError, 'resize-y')}
        {...rest}
      />
      <Messages help={help} error={error} helpId={helpId} errorId={errorId} />
    </div>
  );
});

// ---------------------------------------------------------------------------

export interface SelectFieldProps
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, help, error, required, id, className, children, ...rest },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const helpId = `${fieldId}-help`;
    const errorId = `${fieldId}-error`;
    const hasError = Boolean(error);

    return (
      <div className={className}>
        <label htmlFor={fieldId} className={LABEL_CLASS}>
          {label}
          {required && <span className="ml-0.5 text-burgundy" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(hasError, Boolean(help), helpId, errorId)}
          className={controlClasses(hasError, 'appearance-none pr-9')}
          {...rest}
        >
          {children}
        </select>
        <Messages help={help} error={error} helpId={helpId} errorId={errorId} />
      </div>
    );
  },
);

export default Field;
