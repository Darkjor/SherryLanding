# Sherry Landing — Seguimiento del Proyecto

> Última actualización: 2026-05-31

---

## Estado actual

| Área | Estado |
|------|--------|
| Build & Deploy | ✅ Funcionando en GitHub Pages |
| Diseño visual | ✅ Polish completo (2 pasadas) |
| Tipografía responsive | ✅ Todos los breakpoints corregidos |
| Textos que se salen | ✅ Corregido — break-words global + overflow-x hidden |
| Padding en orillas | ✅ Corregido — px-4 sm:px-6 lg:px-10 |
| Datos reales | ❌ Pendiente (ver abajo) |

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
