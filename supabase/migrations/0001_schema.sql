-- ============================================================================
-- Sherry Studio — 0001_schema.sql
-- Esquema de base de datos (Postgres / Supabase).
--
-- Mapea 1:1 con src/lib/types.ts (snake_case en DB <-> camelCase en TS).
-- Tablas de CONTENIDO usan ids de texto legibles (slugs) donde el seed los tiene.
-- Tablas de OPERACIÓN usan uuid.
-- Ejecutar PRIMERO. Luego 0002_rls.sql, luego seed.sql.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- CONTENIDO DE MARKETING
-- ----------------------------------------------------------------------------

-- Service
create table if not exists services (
  id          text primary key,
  name        text not null,
  description text not null,
  price_range text not null,
  duration_min int  not null default 60,
  frequency   text not null,
  category    text not null check (category in ('nails','feet','hair','experience','retail','events')),
  sort_order  int  not null default 0
);

-- Membership (plan de marketing mostrado en la landing; benefits como jsonb)
create table if not exists memberships (
  id            text primary key,
  name          text not null,
  price         numeric not null,
  price_display text not null,
  period        text not null,
  tagline       text not null,
  benefits      jsonb not null default '[]'::jsonb,
  savings       text not null,
  recommended   boolean not null default false,
  cta_text      text not null,
  sort_order    int not null default 0
);

-- Testimonial
create table if not exists testimonials (
  id         text primary key,
  name       text not null,
  role       text not null,
  quote      text not null,
  rating     int not null default 5 check (rating between 1 and 5),
  avatar_url text,
  sort_order int not null default 0
);

-- FAQItem
create table if not exists faq (
  id         text primary key,
  question   text not null,
  answer     text not null,
  sort_order int not null default 0
);

-- Gesture
create table if not exists gestures (
  id          text primary key,
  number      text not null,
  name        text not null,
  description text not null,
  sort_order  int not null default 0
);

-- Principle (filosofía)
create table if not exists philosophy (
  id         text primary key,
  number     text not null,
  title      text not null,
  body       text not null,
  sort_order int not null default 0
);

-- SiteSettings (registro único — patrón singleton id = 1)
create table if not exists site_settings (
  id        int primary key default 1 check (id = 1),
  whatsapp  text not null default '',
  email     text not null default '',
  address   text not null default '',
  instagram text not null default '',
  hours     text[] not null default array[]::text[]
);

-- ----------------------------------------------------------------------------
-- OPERACIÓN
-- ----------------------------------------------------------------------------

-- Staff
create table if not exists staff (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null,
  active     boolean not null default true,
  sort_order int not null default 0
);

-- MembershipPlan (plan vendible en operación)
create table if not exists membership_plans (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  price  numeric not null,
  active boolean not null default true
);

-- Client
create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  email           text,
  notes           text,
  membership_tier text check (membership_tier in ('RITUAL','MAISON','SHERRY VIP')),
  created_at      timestamptz not null default now()
);

-- Appointment
create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete set null,
  client_name  text not null,
  client_phone text not null,
  service_id   text references services(id) on delete set null,
  service_name text not null,
  staff_id     uuid references staff(id) on delete set null,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  status       text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  notes        text,
  source       text not null default 'admin' check (source in ('online','admin')),
  created_at   timestamptz not null default now()
);

-- Member (membresía activa de una clienta)
create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  plan_id    uuid not null references membership_plans(id) on delete restrict,
  status     text not null default 'active' check (status in ('active','paused','cancelled')),
  started_at timestamptz not null default now()
);

-- Sale
create table if not exists sales (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  client_id      uuid references clients(id) on delete set null,
  tip            numeric not null default 0,
  total          numeric not null default 0,
  payment_method text not null default 'cash' check (payment_method in ('cash','card','transfer')),
  created_at     timestamptz not null default now()
);

-- SaleItem (líneas de una venta; se borran en cascada con la venta)
create table if not exists sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references sales(id) on delete cascade,
  description text not null,
  quantity    int not null default 1,
  unit_price  numeric not null default 0
);

-- ----------------------------------------------------------------------------
-- ÍNDICES
-- ----------------------------------------------------------------------------

create index if not exists idx_appointments_start_at on appointments (start_at);
create index if not exists idx_appointments_status   on appointments (status);
create index if not exists idx_sale_items_sale_id    on sale_items (sale_id);
create index if not exists idx_members_client_id     on members (client_id);
create index if not exists idx_sales_client_id       on sales (client_id);
create index if not exists idx_appointments_client_id on appointments (client_id);
