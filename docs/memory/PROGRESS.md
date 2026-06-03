# Sherry Landing + Sherry Studio — Seguimiento del Proyecto

> Última actualización: 2026-06-03

---

## Estado actual

| Área | Estado |
|------|--------|
| Landing build & deploy | ✅ GitHub Pages |
| Diseño / tipografía responsive | ✅ Polish completo |
| **Sherry Studio (admin tipo Fresha)** | ✅ Construido — rama `feat/admin-panel` |
| Backend Supabase (schema/RLS/seed/edge fn) | ✅ Código listo — falta que el usuario cree el proyecto (ver SETUP.md) |
| Auth (login valery, guards, lockout) | ✅ |
| Módulos: agenda, reservas, clientes, servicios, membresías, equipo, ventas, reportes, contenido | ✅ |
| Reserva online en la landing | ✅ BookingDialog montado |
| Datos reales (contacto/testimonios) | ❌ Pendiente — ahora se llenan desde /admin/contenido |

### Sherry Studio — pasos para activarlo
1. Crear proyecto gratis en Supabase (ver `SETUP.md`).
2. Correr `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `seed.sql`.
3. Crear usuario `valery@sherry.local` / `valery` (Auto Confirm).
4. Pegar `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` en `.env` y en GitHub secrets.
5. (Opcional) desplegar edge function `publish` + secretos GitHub para el botón "Publicar".

---

## Live

- **URL:** https://darkjor.github.io/SherryLanding
- **Repo:** https://github.com/Darkjor/SherryLanding

---

## Datos reales pendientes (bloquean lanzamiento)

- [ ] WhatsApp real → `src/components/FinalCTA.astro` y `src/components/Footer.astro`
- [ ] Email real → `src/components/FinalCTA.astro`
- [ ] Dirección física → `src/components/FinalCTA.astro`
- [ ] Instagram handle real → `src/components/Footer.astro`
- [ ] 3 testimonios reales de clientes → `src/data/testimonials.ts`
- [ ] Fotografía del espacio (hero + 6 servicios)

---

## Historial de cambios

### 2026-05-31 — Typography & Spacing Polish
- Tipografía responsive en todos los componentes (mobile-first)
- `break-words` / `overflow-wrap` global como red de seguridad
- `overflow-x: hidden` en html/body
- Padding alejado de orillas: `px-4 sm:px-6 lg:px-10`
- `<br />` en Footer reemplazados por `<span class="block">`
- 15 archivos modificados, build 3.35s

### 2026-05-31 — Design Polish (23 issues)
- NavBar mobile overflow
- MAISON card badge y escala
- Stats en mobile (grid-cols-1 en 375px)
- FAQ border y padding responsive
- Footer separator con gold
- IntersectionObserver fade-in + prefers-reduced-motion
- Preconnect para Google Fonts

### 2026-05-31 — Deploy a GitHub Pages
- Repo público en GitHub
- Workflow GitHub Actions con Node 22
- `--legacy-peer-deps` para @astrojs/tailwind vs Astro 6
- `base: '/SherryLanding'` en astro.config.mjs

### 2026-05-31 — Build inicial
- Astro 6.4.2 + Tailwind CSS 3.4.19
- 11 componentes + sistema de validación (5 agentes)
- Brand tokens: burgundy, bone, gold, gris
- Fuentes: Playfair Display, Cormorant Garamond, Montserrat
