# Seguridad — Sherry Studio (admin)

Notas para el equipo sobre el modelo de seguridad del panel de administración.

## Qué se expone en el navegador

- **Solo la `anon` key** (`PUBLIC_SUPABASE_ANON_KEY`) y la URL del proyecto
  (`PUBLIC_SUPABASE_URL`) llegan al cliente. Esto es **seguro por diseño**: la
  `anon` key está pensada para ser pública.
- **NUNCA** debe llegar al navegador la `service_role` key de Supabase ni ningún
  token de GitHub (`GITHUB_TOKEN`, PATs, etc.). La `service_role` salta toda la
  seguridad de fila y comprometería la base de datos entera. Mantenla solo en
  secretos de servidor / CI, jamás en código de cliente ni en variables `PUBLIC_`.

## Dónde vive la seguridad real

- **RLS (Row Level Security)** en Supabase es la frontera real. Aunque cualquiera
  tenga la `anon` key, las políticas RLS deciden qué filas puede leer/escribir
  cada usuario autenticado. El frontend confía en el JWT que emite Supabase Auth.
- El guard de rutas (`AuthGuard`) y la pantalla de login son **conveniencia de
  UX**, no seguridad. Un cliente malicioso siempre puede saltarse el JavaScript;
  RLS es lo que de verdad protege los datos.

## Rate limiting / lockout

- El login implementa un **lockout de cliente** (`localStorage`): tras 5 intentos
  fallidos se bloquea 60 s. Mitiga fuerza bruta casual desde un navegador, pero
  es trivial de eludir borrando `localStorage`.
- Las **protecciones reales** contra abuso son el rate-limiting del lado de
  Supabase Auth y, de nuevo, RLS.

## Transporte

- **HTTPS obligatorio**: GitHub Pages sirve el sitio por HTTPS y Supabase solo
  acepta conexiones TLS. Las credenciales y los JWT viajan cifrados.

## Antes de lanzar

- **Cambia la contraseña de `valery@sherry.local`.** La credencial
  `valery` / `valery` es débil a propósito para desarrollo. Para cambiarla:
  - En el **panel de Supabase**: Authentication → Users → selecciona el usuario →
    *Reset password* / *Update user*, o
  - Programáticamente desde un entorno de servidor con la `service_role` key
    usando `supabase.auth.admin.updateUserById(...)` (nunca desde el navegador).
- Revisa que no haya secretos de servidor en variables `PUBLIC_*` ni en el repo.
