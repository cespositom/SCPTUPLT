-- ============================================================
-- SCARPIG REPUESTOS - Migration 001 - Init
-- Ejecutar en Supabase Studio > SQL Editor
-- ============================================================

-- 1. ENUM rol de usuario
do $$ begin
  create type user_role as enum ('admin', 'vendedor');
exception when duplicate_object then null;
end $$;

-- 2. TABLA solicitudes
create table if not exists solicitudes (
  id               uuid primary key default gen_random_uuid(),
  n_solicitud      text unique not null,
  n_siniestro      text,
  tipo_vehiculo    text,
  marca            text,
  modelo           text,
  anio             integer,
  vin              text,
  patente          text,
  region_taller    text,
  liquidador       text,
  fecha_solicitud  date,
  tipo_compra      text,
  fuente           text,
  catalogo         text,
  estado           text not null default 'pendiente'
                     check (estado in ('pendiente','en_proceso','cotizada','cerrada')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 3. TABLA repuestos
create table if not exists repuestos (
  id               uuid primary key default gen_random_uuid(),
  solicitud_id     uuid not null references solicitudes(id) on delete cascade,
  numero_item      integer,
  nombre_es        text,
  nombre_en        text,
  codigo_original  text,
  n_parte          text,
  precio_ofertado  numeric(12,2),
  proveedor        text,
  created_at       timestamptz not null default now()
);

-- 4. TABLA usuarios (extiende auth.users)
create table if not exists usuarios (
  id        uuid primary key references auth.users(id) on delete cascade,
  nombre    text,
  email     text unique,
  rol       user_role not null default 'vendedor',
  activo    boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. ÍNDICES
create index if not exists idx_solicitudes_n_solicitud on solicitudes(n_solicitud);
create index if not exists idx_solicitudes_patente     on solicitudes(patente);
create index if not exists idx_solicitudes_estado      on solicitudes(estado);
create index if not exists idx_repuestos_solicitud_id  on repuestos(solicitud_id);
create index if not exists idx_repuestos_codigo        on repuestos(codigo_original);

-- 6. TRIGGER updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists solicitudes_updated_at on solicitudes;
create trigger solicitudes_updated_at
  before update on solicitudes
  for each row execute function update_updated_at();

-- 7. RLS
alter table solicitudes enable row level security;
alter table repuestos    enable row level security;
alter table usuarios     enable row level security;

-- Admin: acceso total
create policy "admin_solicitudes_all" on solicitudes
  for all using (
    exists (select 1 from usuarios where id = auth.uid() and rol = 'admin')
  );

create policy "admin_repuestos_all" on repuestos
  for all using (
    exists (select 1 from usuarios where id = auth.uid() and rol = 'admin')
  );

-- Vendedor: solo lectura
create policy "vendedor_solicitudes_read" on solicitudes
  for select using (
    exists (select 1 from usuarios where id = auth.uid() and rol = 'vendedor')
  );

create policy "vendedor_repuestos_read" on repuestos
  for select using (
    exists (select 1 from usuarios where id = auth.uid() and rol = 'vendedor')
  );

-- Usuarios: cada uno ve su propio perfil
create policy "usuarios_self" on usuarios
  for select using (auth.uid() = id);

-- Service role bypasses RLS (para N8N)
-- No se necesita política adicional, service_role ignora RLS por defecto

-- 8. FUNCIÓN para crear perfil automáticamente al registrar usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into usuarios (id, email, rol)
  values (new.id, new.email, 'vendedor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- VERIFICAR: las tablas deben aparecer en el resultado
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
