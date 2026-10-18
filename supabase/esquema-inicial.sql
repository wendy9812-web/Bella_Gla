-- ============================================================================
--  BELLA GLAM · Esquema inicial en Supabase
-- ----------------------------------------------------------------------------
--  CÓMO USARLO:
--    1. Entra a tu proyecto en https://supabase.com
--    2. Menú izquierdo -> "SQL Editor" -> botón "New query"
--    3. Copia TODO este archivo, pégalo ahí y pulsa "Run"
--
--  Se puede ejecutar varias veces sin dañar nada (todo usa IF NOT EXISTS
--  y CREATE OR REPLACE).
--
--  Contraseña, correos y claves NUNCA van en este archivo: eso vive en
--  Supabase (Authentication) y en js/supabase-config.js.
-- ============================================================================


-- ============================================================================
--  1) TABLAS
-- ============================================================================

-- ---------------------------------------------------------------------------
--  pedidos: una fila por pedido confirmado en pedido.html
-- ---------------------------------------------------------------------------
create table if not exists public.pedidos (
  id              uuid primary key default gen_random_uuid(),   -- número interno, invisible al cliente
  codigo          text not null unique,                          -- código público: BG-MF3K2LQK
  nombre_cliente  text not null,                                 -- quién compra
  telefono        text not null,                                 -- por aquí se contacta y se consulta el pedido
  correo          text,                                          -- opcional
  ciudad          text not null,                                 -- ciudad de entrega
  direccion       text not null,                                 -- dirección de entrega
  pago            text default 'Pago contraentrega',             -- forma de pago elegida
  notas           text,                                          -- indicaciones extra del cliente
  items           jsonb  not null default '[]'::jsonb,           -- "foto" de los productos comprados
  total           numeric(12,2) not null default 0,              -- total en pesos
  estado          text   not null default 'pendiente',           -- estado del pedido (lo cambia la admin)
  creado_en       timestamptz not null default now(),            -- fecha del pedido
  actualizado_en  timestamptz not null default now(),            -- última modificación

  constraint pedidos_codigo_formato    check (codigo ~ '^BG-[A-Z0-9-]{3,20}$'),
  constraint pedidos_nombre_largo      check (char_length(nombre_cliente) between 2 and 120),
  constraint pedidos_telefono_largo    check (char_length(telefono) between 7 and 25),
  constraint pedidos_ciudad_largo      check (char_length(ciudad) between 2 and 80),
  constraint pedidos_direccion_largo   check (char_length(direccion) between 5 and 200),
  constraint pedidos_correo_largo      check (correo is null or char_length(correo) <= 120),
  constraint pedidos_notas_largo       check (notas is null or char_length(notas) <= 500),
  constraint pedidos_pago_valido       check (pago is null or pago in ('Pago contraentrega','Transferencia bancaria')),
  constraint pedidos_total_positivo    check (total >= 0),
  constraint pedidos_estado_valido     check (estado in ('pendiente','en_preparacion','enviado','entregado','cancelado')),
  constraint pedidos_items_es_arreglo  check (jsonb_typeof(items) = 'array')
);

-- ---------------------------------------------------------------------------
--  contactos: una fila por mensaje enviado en contacto.html
-- ---------------------------------------------------------------------------
create table if not exists public.contactos (
  id         uuid primary key default gen_random_uuid(),  -- número interno
  nombre     text not null,                               -- quién escribe
  correo     text,                                        -- opcional
  telefono   text,                                        -- opcional
  ciudad     text,                                        -- opcional
  direccion  text,                                        -- opcional
  mensaje    text not null,                               -- lo que escribió
  creado_en  timestamptz not null default now(),          -- cuándo llegó

  constraint contactos_nombre_largo    check (char_length(nombre) between 2 and 120),
  constraint contactos_mensaje_largo   check (char_length(mensaje) between 2 and 2000),
  constraint contactos_correo_largo    check (correo is null or char_length(correo) <= 120),
  constraint contactos_telefono_largo  check (telefono is null or char_length(telefono) <= 25),
  constraint contactos_ciudad_largo    check (ciudad is null or char_length(ciudad) <= 80),
  constraint contactos_direccion_largo check (direccion is null or char_length(direccion) <= 200)
);

-- ---------------------------------------------------------------------------
--  admins: la lista de correos autorizados a VER los pedidos y mensajes.
--  Esta tabla NO se lee desde el navegador: solo la usa la función es_admin().
--  Por eso, aunque alguien se registre en tu sitio, no verá nada.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email     text primary key,
  creado_en timestamptz not null default now(),
  constraint admins_email_formato check (email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')
);


-- ============================================================================
--  2) ACTIVAR RLS (Row Level Security)
--  Desde este momento, NADIE puede leer ni escribir nada
--  hasta que una política lo permita.
-- ============================================================================
alter table public.pedidos   enable row level security;
alter table public.contactos enable row level security;
alter table public.admins    enable row level security;


-- ============================================================================
--  3) PERMISOS POR ROL
--  anon = visitante sin sesión (tu página pública)
--  authenticated = persona con sesión iniciada (tú en el panel)
-- ============================================================================
revoke all on table public.pedidos   from anon, authenticated;
revoke all on table public.contactos from anon, authenticated;
revoke all on table public.admins    from anon, authenticated;

-- El público SOLO puede crear filas (crear un pedido / enviar un mensaje).
grant insert on public.pedidos   to anon, authenticated;
grant insert on public.contactos to anon, authenticated;

-- Con sesión iniciada se puede leer y (en pedidos) cambiar el estado o borrar.
-- Las políticas de abajo deciden si esa persona concreta es admin.
grant select, update, delete on public.pedidos   to authenticated;
grant select                 on public.contactos to authenticated;

-- admins no se concede a nadie: solo la función es_admin() puede consultarla.


-- ============================================================================
--  4) FUNCIÓN es_admin()
--  Responde: "¿el correo de quien está pidiendo esto está en la lista?"
--  Es "security definer": se ejecuta con permisos del dueño de la base,
--  por eso puede leer la tabla admins aunque el visitante no pueda.
-- ============================================================================
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to authenticated;


-- ============================================================================
--  5) POLÍTICAS
--  INSERT: lo puede hacer cualquiera (comprar o escribir no requiere cuenta).
--  SELECT / UPDATE: solo si es_admin() dice que sí.
-- ============================================================================
drop policy if exists pedidos_cualquiera_crea    on public.pedidos;
drop policy if exists pedidos_admin_lee          on public.pedidos;
drop policy if exists pedidos_admin_actualiza    on public.pedidos;
drop policy if exists pedidos_admin_elimina      on public.pedidos;
drop policy if exists contactos_cualquiera_escribe on public.contactos;
drop policy if exists contactos_admin_lee        on public.contactos;

create policy pedidos_cualquiera_crea
  on public.pedidos for insert
  to anon, authenticated
  with check (true);

create policy pedidos_admin_lee
  on public.pedidos for select
  to authenticated
  using (public.es_admin());

create policy pedidos_admin_actualiza
  on public.pedidos for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy pedidos_admin_elimina
  on public.pedidos for delete
  to authenticated
  using (public.es_admin());

create policy contactos_cualquiera_escribe
  on public.contactos for insert
  to anon, authenticated
  with check (true);

create policy contactos_admin_lee
  on public.contactos for select
  to authenticated
  using (public.es_admin());


-- ============================================================================
--  6) ÍNDICES (hacen las búsquedas rápidas cuando hay muchos pedidos)
-- ============================================================================
create index if not exists pedidos_creado_en_idx on public.pedidos (creado_en desc);
create index if not exists pedidos_estado_idx    on public.pedidos (estado);
create index if not exists pedidos_telefono_idx  on public.pedidos (telefono);
create index if not exists contactos_creado_en_idx on public.contactos (creado_en desc);


-- ============================================================================
--  7) FUNCIÓN consultar_pedido()
--  La usa consulta.html. Devuelve UN pedido, y solo si el código
--  Y el teléfono coinciden. Así un visitante no puede ver pedidos ajenos,
--  porque no puede leer la tabla directamente.
-- ============================================================================
create or replace function public.consultar_pedido(p_codigo text, p_telefono text)
returns table (
  id             uuid,
  codigo         text,
  nombre_cliente text,
  telefono       text,
  correo         text,
  ciudad         text,
  direccion      text,
  pago           text,
  notas          text,
  items          jsonb,
  total          numeric,
  estado         text,
  creado_en      timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.codigo, p.nombre_cliente, p.telefono, p.correo, p.ciudad,
         p.direccion, p.pago, p.notas, p.items, p.total, p.estado, p.creado_en
  from public.pedidos p
  where upper(p.codigo) = upper(trim(p_codigo))
    and regexp_replace(p.telefono, '\D', '', 'g')
        = regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g')
  limit 1;
$$;

revoke all on function public.consultar_pedido(text, text) from public;
grant execute on function public.consultar_pedido(text, text) to anon, authenticated;


-- ============================================================================
--  8) ¿QUIÉN ES ADMIN?  (hazlo DESPUÉS de crear tu usuario, ver más abajo)
--  Cambia el correo por el tuyo y quita los dos guiones del principio.
-- ============================================================================
-- insert into public.admins (email) values ('tu-correo@ejemplo.com')
--   on conflict (email) do nothing;


-- ============================================================================
--  9) COMPROBACIONES (opcional, para ver que todo quedó bien)
-- ============================================================================
-- ¿RLS activo en las 3 tablas?  -> deben salir 3 filas con rls_activo = true
select c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('pedidos','contactos','admins')
order by c.relname;

-- ¿Se crearon las 6 políticas?  -> deben salir 6 filas
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('pedidos','contactos')
order by tablename, policyname;

-- ¿Existen las 4 columnas de estado permitidas y las funciones?
select proname from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('es_admin','consultar_pedido')
order by proname;

-- ============================================================
-- 8. MEJORAS DE SEGURIDAD APLICADAS DESPUÉS (2026-10-17)
-- ------------------------------------------------------------
-- Freno anti-spam: evita que el mismo teléfono mande dos pedidos
-- seguidos en menos de 60 segundos. Protege el panel de pedidos
-- basura enviados en bucle por un programa automático.
--
-- Se marca SECURITY DEFINER a propósito: la comprobación necesita LEER
-- la tabla `pedidos`, y el visitante anónimo no tiene permiso de lectura.
-- ============================================================

create or replace function public.limitar_pedidos_seguidos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
      from public.pedidos p
     where p.telefono = new.telefono
       and p.creado_en > now() - interval '60 seconds'
  ) then
    raise exception 'Ya recibimos un pedido de este telefono hace menos de un minuto. Intenta de nuevo en un momento.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists pedidos_limite_por_telefono on public.pedidos;

create trigger pedidos_limite_por_telefono
before insert on public.pedidos
for each row
execute function public.limitar_pedidos_seguidos();

-- Comprobación: debe salir 1 fila (la función enganchada a su disparador)
select p.proname as funcion, t.tgname as disparador
from pg_proc p
left join pg_trigger t on t.tgfoid = p.oid
where p.pronamespace = 'public'::regnamespace
  and p.proname = 'limitar_pedidos_seguidos';
