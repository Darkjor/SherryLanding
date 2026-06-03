/**
 * Sherry Studio — Formulario de acceso (React island).
 *
 * UI de marca: fondo bone, acentos burgundy/gold, encabezado Playfair.
 * Accesible: labels asociadas, aria-invalid en error, foco gestionado, Enter
 * envía. Usa el `signIn` consciente del lockout. Redirige al panel al lograrlo.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { signIn } from '../../lib/auth';

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Foco inicial en el email.
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Al aparecer un error, lo anunciamos moviendo el foco hacia él.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (!email.trim() || !password) {
      setError('Introduce tu correo y contraseña.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);

    if (result.ok) {
      // BASE_URL termina en '/', p.ej. '/SherryLanding/'.
      window.location.replace(`${import.meta.env.BASE_URL}admin`);
      return; // No reactivamos el botón: la página se está reemplazando.
    }

    setError(result.error ?? 'No se pudo iniciar sesión.');
    setSubmitting(false);
  }

  const hasError = error !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bone px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-bone-dark bg-bone-light px-8 py-10 shadow-sm sm:px-10">
          <header className="mb-8 text-center">
            <p className="label-sherry mb-2">Acceso privado</p>
            <h1 className="font-serif text-3xl text-burgundy">Sherry Studio</h1>
            <p className="mt-2 font-sans text-sm text-gris">
              Inicia sesión para gestionar tu salón.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1.5 block font-sans text-xs font-semibold tracking-wide uppercase text-burgundy"
              >
                Correo
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="valery@sherry.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className="w-full rounded-lg border border-gris-light bg-bone px-3.5 py-2.5 font-sans text-sm text-burgundy-dark placeholder:text-gris-light focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-1.5 block font-sans text-xs font-semibold tracking-wide uppercase text-burgundy"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className="w-full rounded-lg border border-gris-light bg-bone px-3.5 py-2.5 font-sans text-sm text-burgundy-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60"
              />
            </div>

            {hasError && (
              <p
                id="login-error"
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="mb-5 rounded-lg border border-burgundy/30 bg-burgundy/5 px-3.5 py-2.5 font-sans text-sm text-burgundy focus:outline-none"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-burgundy px-4 py-2.5 font-sans text-sm font-semibold tracking-wide text-bone transition-colors hover:bg-burgundy-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-bone-light disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-bone/40 border-t-bone"
                />
              )}
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-sans text-xs text-gris">
          Acceso restringido al equipo de Sherry.
        </p>
      </div>
    </main>
  );
}
