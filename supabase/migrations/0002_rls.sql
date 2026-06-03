-- ============================================================================
-- Sherry Studio — 0002_rls.sql
-- Row Level Security (RLS) — la frontera de seguridad REAL.
--
-- MODELO DE SEGURIDAD
-- -------------------
-- La anon key de Supabase es PÚBLICA por diseño: se incrusta en el frontend.
-- Por sí sola NO da acceso a nada; lo único que protege los datos es RLS.
-- Por eso:
--   * Toda tabla tiene RLS habilitada (deny-by-default: sin policy = sin acceso).
--   * El rol `anon` (visitante anónimo) solo puede:
--       - LEER contenido de marketing (services, memberships, testimonials,
--         faq, gestures, philosophy, site_settings) + staff + membership_plans.
--       - INSERTAR citas SOLO desde el formulario público de reserva online,
--         con condiciones estrictas (ver policy appointments_anon_insert).
--   * El rol `authenticated` (admin logueado, p.ej. Valery) tiene CRUD completo
--     en todo, ya que es personal de confianza tras login.
--   * Datos sensibles (clients, sales, sale_items, members) NO tienen NINGÚN
--     acceso anon: ni lectura ni escritura.
--   * La service_role key (bypassa RLS) NUNCA va al frontend; solo backend/CI.
--
-- Ejecutar DESPUÉS de 0001_schema.sql.
-- ============================================================================

-- Habilitar RLS en TODAS las tablas
alter table services         enable row level security;
alter table memberships      enable row level security;
alter table testimonials     enable row level security;
alter table faq              enable row level security;
alter table gestures         enable row level security;
alter table philosophy       enable row level security;
alter table site_settings    enable row level security;
alter table staff            enable row level security;
alter table membership_plans enable row level security;
alter table clients          enable row level security;
alter table appointments     enable row level security;
alter table members          enable row level security;
alter table sales            enable row level security;
alter table sale_items       enable row level security;

-- ----------------------------------------------------------------------------
-- CONTENIDO PÚBLICO + staff + membership_plans
-- Lectura: anon + authenticated. Escritura: solo authenticated.
-- ----------------------------------------------------------------------------

-- services
create policy services_public_read on services
  for select to anon, authenticated using (true);
create policy services_auth_write on services
  for all to authenticated using (true) with check (true);

-- memberships
create policy memberships_public_read on memberships
  for select to anon, authenticated using (true);
create policy memberships_auth_write on memberships
  for all to authenticated using (true) with check (true);

-- testimonials
create policy testimonials_public_read on testimonials
  for select to anon, authenticated using (true);
create policy testimonials_auth_write on testimonials
  for all to authenticated using (true) with check (true);

-- faq
create policy faq_public_read on faq
  for select to anon, authenticated using (true);
create policy faq_auth_write on faq
  for all to authenticated using (true) with check (true);

-- gestures
create policy gestures_public_read on gestures
  for select to anon, authenticated using (true);
create policy gestures_auth_write on gestures
  for all to authenticated using (true) with check (true);

-- philosophy
create policy philosophy_public_read on philosophy
  for select to anon, authenticated using (true);
create policy philosophy_auth_write on philosophy
  for all to authenticated using (true) with check (true);

-- staff (lectura pública: la agenda online puede mostrar especialistas)
create policy staff_public_read on staff
  for select to anon, authenticated using (true);
create policy staff_auth_write on staff
  for all to authenticated using (true) with check (true);

-- membership_plans (lectura pública: planes vendibles visibles)
create policy membership_plans_public_read on membership_plans
  for select to anon, authenticated using (true);
create policy membership_plans_auth_write on membership_plans
  for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- site_settings — lectura pública, update solo authenticated (registro único)
-- ----------------------------------------------------------------------------
create policy site_settings_public_read on site_settings
  for select to anon, authenticated using (true);
create policy site_settings_auth_update on site_settings
  for update to authenticated using (true) with check (true);
create policy site_settings_auth_insert on site_settings
  for insert to authenticated with check (true);

-- ----------------------------------------------------------------------------
-- appointments
-- authenticated: CRUD completo.
-- anon: SOLO INSERT desde reserva online, con condiciones estrictas.
--       (sin SELECT/UPDATE/DELETE para anon.)
-- ----------------------------------------------------------------------------
create policy appointments_auth_all on appointments
  for all to authenticated using (true) with check (true);

create policy appointments_anon_insert on appointments
  for insert to anon
  with check (
    status = 'pending'
    and source = 'online'
    and start_at > now()
    and length(trim(client_name)) > 0
    and length(trim(client_phone)) > 0
  );

-- ----------------------------------------------------------------------------
-- Datos sensibles — SOLO authenticated, sin acceso anon alguno.
-- (No se crea ninguna policy para anon => deny-by-default.)
-- ----------------------------------------------------------------------------
create policy clients_auth_all on clients
  for all to authenticated using (true) with check (true);

create policy sales_auth_all on sales
  for all to authenticated using (true) with check (true);

create policy sale_items_auth_all on sale_items
  for all to authenticated using (true) with check (true);

create policy members_auth_all on members
  for all to authenticated using (true) with check (true);
