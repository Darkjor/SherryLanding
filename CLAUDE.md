# CLAUDE.md — Sherry Landing + Sherry Studio

Guía para trabajar en este repositorio. Léela antes de hacer cambios.

## Qué es esto

Dos cosas en un mismo proyecto Astro:

1. **Landing** (`/`): sitio de marketing estático de "Sherry ✦ Luxury Beauty House" (Zapopan, Jalisco). SEO, feel editorial de lujo.
2. **Sherry Studio** (`/admin/*`): panel de gestión tipo Fresha (agenda, reservas online, clientes/CRM, servicios, membresías, equipo, ventas/POS, reportes, y CMS del contenido de la landing). Login en `/admin/login`.

## Stack

- **Astro 6** `output: 'static'`, `base: '/SherryLanding'`, deploy en GitHub Pages.
- **Tailwind 3** (tokens de marca en `tailwind.config.mjs`: burgundy/bone/gold/gris; fuentes Playfair/Cormorant/Montserrat).
- **React islands** (`@astrojs/react`) para todo el admin y el formulario de reserva.
- **Supabase** (Postgres + Auth + Storage + Edge Functions + Realtime) como backend.
- Instalación: `npm install --legacy-peer-deps` (conflicto peer dep @astrojs/tailwind ↔ Astro 6).

## Comandos

```bash
npm run dev        # servidor local
npm run build      # build estático a dist/
npm run preview    # previsualizar build
npm run validate   # validación de contenido (requiere dist/ — corre build antes)
```

## Arquitectura de datos (CLAVE)

- **Contenido de marketing** (services, memberships, testimonials, faq, gestures, philosophy, site_settings): la landing lo lee **en build-time** vía `src/lib/content.ts`, que consulta Supabase y hace **fallback automático** a `src/data/*.ts` si Supabase no está configurado o falla. Por eso el sitio siempre buildea aunque no haya credenciales.
- **Datos operativos** (clients, staff, appointments, sales, sale_items, members, membership_plans): **runtime** vía Supabase con Realtime en el admin. Las reservas online entran sin rebuild.
- Cambios de contenido se ven en el sitio live tras **"Publicar cambios"** en el admin → Edge Function `publish` → `workflow_dispatch` → rebuild (~1 min).

## Mapa de archivos

- `src/lib/types.ts` — **contrato de tipos** de todo el dominio. Fuente de verdad.
- `src/lib/supabase.ts` — cliente Supabase (anon key, `isSupabaseConfigured`, `assertSupabase`). Solo anon key en cliente, NUNCA service_role.
- `src/lib/auth.ts` — signIn/signOut/getSession + lockout client-side.
- `src/lib/content.ts` — getters build-time con fallback (landing).
- `src/lib/db/*.ts` — repos tipados por entidad (services, content, appointments, clients, staff, members, sales, reports).
- `src/components/admin/` — shell (`AppShell`, `AdminPage`, `AuthGuard`, `useSession`), primitivos UI (`ui/`), módulos (`agenda/`, `crm/`, `sales/`, `catalog/`, `content/`), entries (`entries/`).
- `src/components/booking/` — formulario público de reserva (`BookingDialog`, `BookingMount`).
- `src/pages/admin/*.astro` — rutas del admin (cada una monta un island vía `AdminPage active="...")`.
- `src/components/*.astro` — secciones de la landing (no cambiar el diseño sin pedirlo).
- `supabase/` — migraciones (`0001_schema.sql`, `0002_rls.sql`), `seed.sql`, edge function `functions/publish/`.
- `SETUP.md` — pasos para crear el proyecto Supabase y conectar credenciales.

## Convenciones

- **AdminPage**: cada página admin hace `() => <AdminPage active="clave"><Modulo/></AdminPage>`. No reimplementar sesión/guard.
- **UI del admin**: registro *product* (impeccable). Reutilizar primitivos de `src/components/admin/ui/`. Prohibido: gradient text, side-stripe borders, glassmorphism, modal-as-first-thought, em dashes en copy.
- **UI de la landing/booking**: registro *brand* (bone/burgundy/gold, Playfair).
- **Rutas/redirects**: siempre con `import.meta.env.BASE_URL` (= `/SherryLanding/`) por el base path de GitHub Pages.
- **Supabase**: envolver TODA llamada admin tras `isSupabaseConfigured`; el build debe pasar sin credenciales (usa fallback).
- TypeScript strict. Sin `any` salvo comentario justificando.

## Seguridad

- La frontera real es **Supabase Auth (JWT) + Row Level Security**, no la contraseña.
- Usuario admin: `valery@sherry.local` / `valery` — **débil a propósito; cambiar antes de lanzar** (ver `SETUP.md` y `src/components/admin/SECURITY.md`).
- RLS (`0002_rls.sql`): contenido lectura pública/escritura autenticada; `appointments` permite INSERT anónimo SOLO para reservas online (validado); clients/sales/members sin acceso anónimo.
- `service_role` key y `GITHUB_TOKEN` jamás en el cliente; el token vive solo como secreto de la Edge Function.
- `.env` está en `.gitignore`. Variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`).

## Estado / pendientes

- Sin Supabase configurado, el admin muestra estados "no configurado" y la landing usa el contenido fallback de `src/data/*.ts`.
- `npm run validate` reporta 2 errores esperados hasta el lanzamiento: TODOs de contacto (WhatsApp/email/dirección) y testimonios placeholder. Se resuelven llenándolos desde `/admin/contenido` (sección Contacto y Testimonios), no editando código.
- Deploy: push a `main` dispara el workflow de GitHub Pages.
