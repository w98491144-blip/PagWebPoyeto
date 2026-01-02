create extension if not exists "pgcrypto";


create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  "order" int default 0,
  is_active boolean default true,
  image_url text,
  rappi_url text,
  pedidosya_url text,
  color_hex text,
  text_color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price_amount numeric(10,2),
  discount_percent numeric(5,2),
  price_display text,
  image_url text,
  rappi_url text,
  pedidosya_url text,
  "order" int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  content text,
  updated_at timestamptz default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text default 'RECIBIDO',
  first_name text not null,
  last_name text not null,
  doc_type text not null,
  doc_number text not null,
  email text not null,
  phone text not null,
  address text,
  item_identification text not null,
  type text not null,
  detail text not null,
  request text not null,
  response_text text,
  responded_at timestamptz
);


create table if not exists reclamacion_counters (
  year int not null,
  current_value int not null default 0,
  primary key (year)
);

create table if not exists reclamaciones (
  id uuid primary key default gen_random_uuid(),
  numero_hoja text not null,
  fecha_registro timestamptz default now(),
  proveedor_nombre_razon_social text not null,
  proveedor_ruc text not null,
  proveedor_domicilio_establecimiento text not null,
  proveedor_codigo_identificacion_establecimiento text,
  consumidor_nombre_completo text not null,
  consumidor_domicilio text not null,
  consumidor_tipo_doc text not null,
  consumidor_num_doc text not null,
  consumidor_telefono text not null,
  consumidor_email text not null,
  consumidor_padre_madre text,
  consumidor_es_menor boolean default false,
  bien_tipo text not null,
  bien_monto_reclamado numeric(10,2) default 0,
  bien_descripcion text not null,
  tipo_registro text not null,
  detalle_reclamacion text not null,
  pedido_consumidor text not null,
  acciones_proveedor text,
  acciones_fecha date,
  confirmacion_consumidor boolean default false,
  confirmacion_consumidor_fecha timestamptz,
  confirmacion_proveedor boolean default false,
  confirmacion_proveedor_fecha timestamptz,
  estado text default 'RECIBIDO',
  respuesta_proveedor text,
  fecha_respuesta timestamptz,
  fecha_comunicacion_respuesta date,
  prorroga_hasta date,
  prorroga_motivo text,
  prorroga_fecha_comunicacion date,
  public_token uuid default gen_random_uuid(),
  updated_at timestamptz default now()
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text,
  hero_title text,
  hero_subtitle text,
  meta_pixel_id text,
  google_tag_id text,
  rappi_url text,
  pedidosya_url text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  whatsapp_url text,
  contact_email text,
  logo_url text,
  favicon_url text,
  footer_logo_url text,
  libro_reclamaciones_logo_url text,
  hero_image_url text,
  top_bar_text text,
  top_bar_bg text,
  top_bar_text_color text,
  header_bg text,
  header_text_color text,
  page_bg text,
  accent_color text,
  accent_text_color text,
  pill_bg text,
  pill_text_color text,
  pill_active_bg text,
  pill_active_text_color text,
  footer_bg text,
  footer_text_color text,
  updated_at timestamptz default now()
);

create unique index if not exists idx_categories_slug on categories (slug);
create unique index if not exists idx_products_slug on products (slug);
create unique index if not exists idx_legal_slug on legal_pages (slug);
create index if not exists idx_products_category on products (category_id);
create index if not exists idx_claims_status on claims (status);
create unique index if not exists idx_reclamaciones_numero on reclamaciones (numero_hoja);
create index if not exists idx_reclamaciones_fecha on reclamaciones (fecha_registro);
create index if not exists idx_reclamaciones_estado on reclamaciones (estado);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


create or replace function public.set_reclamacion_numero()
returns trigger as $$
declare
  target_year int;
  next_value int;
begin
  if new.fecha_registro is null then
    new.fecha_registro = now();
  end if;

  target_year := extract(year from new.fecha_registro)::int;

  insert into reclamacion_counters (year, current_value)
  values (target_year, 1)
  on conflict (year)
  do update set current_value = reclamacion_counters.current_value + 1
  returning current_value into next_value;

  new.numero_hoja := lpad(next_value::text, 9, '0') || '-' || target_year::text;
  return new;
end;
$$ language plpgsql;

create or replace function public.make_new_user_admin()
returns trigger as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'admin')
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'make_new_user_admin'
  ) then
    execute 'create trigger make_new_user_admin after insert on auth.users for each row execute procedure public.make_new_user_admin()';
  end if;
end;
$$;


create or replace function public.get_reclamacion_constancia(claim_id uuid, claim_token uuid)
returns table (
  id uuid,
  numero_hoja text,
  fecha_registro timestamptz,
  proveedor_nombre_razon_social text,
  proveedor_ruc text,
  proveedor_domicilio_establecimiento text,
  proveedor_codigo_identificacion_establecimiento text,
  consumidor_nombre_completo text,
  consumidor_domicilio text,
  consumidor_tipo_doc text,
  consumidor_num_doc text,
  consumidor_telefono text,
  consumidor_email text,
  consumidor_padre_madre text,
  consumidor_es_menor boolean,
  bien_tipo text,
  bien_monto_reclamado numeric,
  bien_descripcion text,
  tipo_registro text,
  detalle_reclamacion text,
  pedido_consumidor text,
  acciones_proveedor text,
  acciones_fecha date,
  confirmacion_consumidor boolean,
  confirmacion_consumidor_fecha timestamptz,
  confirmacion_proveedor boolean,
  confirmacion_proveedor_fecha timestamptz,
  estado text,
  respuesta_proveedor text,
  fecha_respuesta timestamptz,
  fecha_comunicacion_respuesta date,
  prorroga_hasta date,
  prorroga_motivo text,
  prorroga_fecha_comunicacion date
) as $$
begin
  return query
  select
    r.id,
    r.numero_hoja,
    r.fecha_registro,
    r.proveedor_nombre_razon_social,
    r.proveedor_ruc,
    r.proveedor_domicilio_establecimiento,
    r.proveedor_codigo_identificacion_establecimiento,
    r.consumidor_nombre_completo,
    r.consumidor_domicilio,
    r.consumidor_tipo_doc,
    r.consumidor_num_doc,
    r.consumidor_telefono,
    r.consumidor_email,
    r.consumidor_padre_madre,
    r.consumidor_es_menor,
    r.bien_tipo,
    r.bien_monto_reclamado,
    r.bien_descripcion,
    r.tipo_registro,
    r.detalle_reclamacion,
    r.pedido_consumidor,
    r.acciones_proveedor,
    r.acciones_fecha,
    r.confirmacion_consumidor,
    r.confirmacion_consumidor_fecha,
    r.confirmacion_proveedor,
    r.confirmacion_proveedor_fecha,
    r.estado,
    r.respuesta_proveedor,
    r.fecha_respuesta,
    r.fecha_comunicacion_respuesta,
    r.prorroga_hasta,
    r.prorroga_motivo,
    r.prorroga_fecha_comunicacion
  from reclamaciones r
  where r.id = claim_id
    and r.public_token = claim_token;
end;
$$ language plpgsql security definer;

create trigger set_categories_updated_at
before update on categories
for each row
execute function public.set_updated_at();

create trigger set_products_updated_at
before update on products
for each row
execute function public.set_updated_at();

create trigger set_legal_pages_updated_at
before update on legal_pages
for each row
execute function public.set_updated_at();

create trigger set_site_settings_updated_at
before update on site_settings
for each row
execute function public.set_updated_at();

create trigger set_reclamaciones_updated_at
before update on reclamaciones
for each row
execute function public.set_updated_at();

create trigger set_reclamacion_numero_trigger
before insert on reclamaciones
for each row
execute function public.set_reclamacion_numero();


alter table categories enable row level security;
alter table products enable row level security;
alter table legal_pages enable row level security;
alter table claims enable row level security;
alter table reclamaciones enable row level security;
alter table site_settings enable row level security;

-- Public access
create policy "Public categories" on categories
for select
using (is_active = true);

create policy "Public products" on products
for select
using (is_active = true);

create policy "Public legal pages" on legal_pages
for select
using (true);

create policy "Public site settings" on site_settings
for select
using (true);

create policy "Public insert claims" on claims
for insert
with check (true);

create policy "Public insert reclamaciones" on reclamaciones
for insert
with check (true);

-- Admin access (app_metadata.role = 'admin')
create policy "Admin categories select" on categories
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin categories insert" on categories
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin categories update" on categories
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin categories delete" on categories
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin products select" on products
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin products insert" on products
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin products update" on products
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin products delete" on products
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin legal select" on legal_pages
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin legal insert" on legal_pages
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin legal update" on legal_pages
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin claims select" on claims
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin claims update" on claims
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin reclamaciones select" on reclamaciones
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin reclamaciones insert" on reclamaciones
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin reclamaciones update" on reclamaciones
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin settings select" on site_settings
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin settings insert" on site_settings
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin settings update" on site_settings
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Example: assign admin role (run in SQL editor)
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- where email = 'admin@tu-dominio.com';

insert into site_settings (
  brand_name,
  hero_title,
  hero_subtitle,
  meta_pixel_id,
  google_tag_id,
  hero_image_url,
  rappi_url,
  pedidosya_url,
  instagram_url,
  contact_email,
  top_bar_text,
  top_bar_bg,
  top_bar_text_color,
  header_bg,
  header_text_color,
  page_bg,
  accent_color,
  accent_text_color,
  pill_bg,
  pill_text_color,
  pill_active_bg,
  pill_active_text_color,
  footer_bg,
  footer_text_color
)
values (
  'Restaurante Demo',
  'Cocina honesta, sabor diario',
  'Explora el menu y pide directo en tus apps favoritas.',
  null,
  null,
  null,
  'https://www.rappi.com.pe',
  'https://www.pedidosya.com.pe',
  'https://www.instagram.com',
  'contacto@dominio.com',
  'Encuentranos en Rappi y PedidosYa',
  '#D82739',
  '#F4EADC',
  '#60933a',
  '#F4EADC',
  '#F4EADC',
  '#D82739',
  '#F4EADC',
  '#F4EADC',
  '#60933a',
  '#D82739',
  '#F4EADC',
  '#D82739',
  '#F4EADC'
);

insert into categories (name, slug, "order", is_active, color_hex, text_color)
values
  ('Entradas', 'entradas', 1, true, '#60933a', '#F4EADC'),
  ('Platos principales', 'platos-principales', 2, true, '#D82739', '#F4EADC'),
  ('Postres', 'postres', 3, true, '#F4EADC', '#60933a'),
  ('Bebidas', 'bebidas', 4, true, '#F4EADC', '#D82739');

insert into products (
  category_id,
  name,
  slug,
  description,
  price_amount,
  discount_percent,
  price_display,
  "order",
  is_active
)
values
  (
    (select id from categories where slug = 'entradas'),
    'Bruschetta de tomates',
    'bruschetta-de-tomates',
    'Pan tostado con tomates frescos, aceite de oliva y albahaca.',
    18.00,
    0,
    'S/ 18.00',
    1,
    true
  ),
  (
    (select id from categories where slug = 'platos-principales'),
    'Pollo a la parrilla',
    'pollo-a-la-parrilla',
    'Pollo marinado con hierbas, acompanado de ensalada y papa dorada.',
    32.00,
    10,
    'S/ 32.00',
    1,
    true
  ),
  (
    (select id from categories where slug = 'postres'),
    'Cheesecake de limon',
    'cheesecake-de-limon',
    'Cheesecake cremoso con toques citricos y base crocante.',
    16.00,
    0,
    'S/ 16.00',
    1,
    true
  ),
  (
    (select id from categories where slug = 'bebidas'),
    'Limonada de la casa',
    'limonada-de-la-casa',
    'Limonada fresca con hierbabuena.',
    10.00,
    20,
    'S/ 10.00',
    1,
    true
  );

insert into legal_pages (slug, title, content)
values
  (
    'privacidad',
    'Politica de Privacidad',
    $$
## 1. Identidad del Responsable del Tratamiento

El presente documento describe la Politica de Privacidad del sitio web [NOMBRE DEL SITIO], operado por [NOMBRE DE LA EMPRESA O PERSONA NATURAL], con domicilio en Peru, quien actua como responsable del tratamiento de los datos personales conforme a la Ley N. 29733 - Ley de Proteccion de Datos Personales y su Reglamento.

Para cualquier consulta relacionada con esta Politica de Privacidad, el usuario puede contactarse a traves del correo electronico: [correo@dominio.com].

## 2. Informacion que se recopila

El sitio web puede recopilar informacion personal y no personal de los usuarios, de acuerdo con la forma en que interactuan con el sitio.

### a) Informacion proporcionada directamente por el usuario

Cuando corresponda, el usuario podra proporcionar:
- Nombre y apellidos
- Direccion de correo electronico
- Informacion necesaria para pedidos, consultas o comunicaciones comerciales

### b) Informacion recopilada automaticamente

Al navegar por el sitio, se puede recopilar informacion de forma automatica, como:
- Direccion IP
- Tipo de navegador y dispositivo
- Paginas visitadas
- Fecha y hora de acceso
- Informacion de navegacion y eventos de interaccion

Esta informacion no permite identificar directamente al usuario como persona natural, pero puede ser considerada dato personal indirecto conforme a la normativa peruana.

## 3. Uso de cookies y tecnologias similares

El sitio web utiliza cookies y tecnologias similares, propias y de terceros, con las siguientes finalidades:
- Analizar el comportamiento de navegacion de los usuarios
- Medir el rendimiento del sitio
- Realizar acciones de marketing y medicion de conversiones

En particular, el sitio puede utilizar herramientas de terceros como:
- Meta Platforms, Inc. (Meta Pixel)
- Google LLC (Google Analytics / Google Ads)

Estas herramientas pueden recopilar informacion como direccion IP, identificadores de navegador, eventos de navegacion y ubicacion aproximada (pais o ciudad) inferida a partir de la conexion del usuario.

Nota: El sitio no accede a datos de geolocalizacion precisa, GPS ni informacion sensible del dispositivo.

El usuario puede aceptar o rechazar el uso de cookies no esenciales a traves del banner de consentimiento disponible al ingresar al sitio.

## 4. Finalidad del tratamiento de los datos

Los datos recopilados son utilizados para las siguientes finalidades:
- Prestar y mejorar los servicios ofrecidos en el sitio web
- Analizar estadisticas de navegacion y uso del sitio
- Medir campanas publicitarias y conversiones
- Enviar comunicaciones comerciales, cuando el usuario lo haya autorizado

Los datos no seran utilizados para finalidades distintas a las aqui descritas.

## 5. Transferencia de datos a terceros

El sitio web no vende ni comercializa datos personales de los usuarios.

Sin embargo, determinados datos pueden ser tratados por proveedores tecnologicos externos (como Meta o Google) unicamente para las finalidades descritas en esta politica y bajo sus propias politicas de privacidad.

Estos proveedores pueden almacenar informacion en servidores ubicados fuera del Peru.

## 6. Conservacion de la informacion

Los datos personales seran conservados unicamente durante el tiempo necesario para cumplir con las finalidades para las cuales fueron recopilados, o mientras exista una relacion legitima con el usuario.

Los datos de navegacion y cookies se conservan conforme a los plazos definidos por los proveedores tecnologicos correspondientes.

## 7. Derechos del usuario (Derechos ARCO)

De conformidad con la Ley N. 29733, el usuario puede ejercer en cualquier momento sus derechos de:
- Acceso
- Rectificacion
- Cancelacion
- Oposicion

Para ejercer estos derechos, el usuario puede enviar una solicitud al correo electronico [correo@dominio.com], indicando claramente su requerimiento.

## 8. Seguridad de la informacion

El responsable adopta medidas tecnicas y organizativas razonables para proteger la informacion personal de los usuarios y evitar accesos no autorizados, perdida o uso indebido de los datos.

## 9. Enlaces a sitios de terceros

El sitio web puede contener enlaces a sitios web de terceros. El responsable no se hace responsable por las practicas de privacidad ni el contenido de dichos sitios, los cuales se rigen por sus propias politicas.

## 10. Modificaciones de la Politica de Privacidad

El responsable se reserva el derecho de modificar la presente Politica de Privacidad en cualquier momento. Cualquier cambio sera publicado en esta misma pagina y entrara en vigor desde su publicacion.

## 11. Aceptacion

El uso del sitio web implica la aceptacion de esta Politica de Privacidad.
El uso de cookies no esenciales estara sujeto al consentimiento del usuario mediante el banner correspondiente.

$$
  ),
  (
    'cookies',
    'Politica de Cookies',
    $$
## Cookies

Este es un texto de ejemplo sobre cookies. Puedes editarlo desde el panel admin.
$$
  ),
  (
    'terminos',
    'Terminos y Condiciones',
    $$
## Terminos

Este es un texto de ejemplo sobre terminos y condiciones. Puedes editarlo desde el panel admin.
$$
  );

grant execute on function public.get_reclamacion_constancia(uuid, uuid) to anon, authenticated;
