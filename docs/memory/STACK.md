# Stack Técnico — Sherry Landing

## Framework & Build

- **Astro 6.4.2** — output: static
- **Tailwind CSS 3.4.19** vía `@astrojs/tailwind@6.0.2`
- `npm install --legacy-peer-deps` requerido (conflict de peer deps)

## Deploy

- **GitHub Pages** — https://darkjor.github.io/SherryLanding
- **GitHub Actions** — `.github/workflows/deploy.yml`
- Node 22, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`

## Config crítica (astro.config.mjs)

```js
site: 'https://darkjor.github.io',
base: '/SherryLanding',
output: 'static',
```

Sin `base`, los assets no cargan en GitHub Pages.

## Comandos

```bash
npm run dev       # servidor local
npm run build     # genera dist/
npm run validate  # validación de datos reales (requiere dist/)
```

## Diseño

| Token | Valor |
|-------|-------|
| burgundy | #5C1A2E |
| bone | #F5F0E8 |
| gold | #B8963E |
| gris | #8C8680 |
| font-serif | Playfair Display |
| font-garamond | Cormorant Garamond |
| font-sans | Montserrat |
