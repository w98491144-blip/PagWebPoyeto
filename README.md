# Micrositio Restaurante (Next.js + Supabase)

Micrositio tipo catalogo con categorias, productos, paginas legales y Libro de Reclamaciones. Solo sitio publico. **No** incluye carrito, pagos ni checkout.

## Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Supabase (Postgres, Auth, Storage)

## Setup rapido

### 1) Variables de entorno
Crea un archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 2) Crear proyecto en Supabase
1. Crea un proyecto en Supabase.
2. En el SQL editor, ejecuta:
   - `supabase/bootstrap_no_storage.sql`

### 3) Storage (imagenes)
Opcional si vas a usar Supabase Storage. Crea un bucket publico llamado `images`.

Opcional (SQL):
```
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;
```

Policitas recomendadas:
```
-- lectura publica
create policy "Public read images" on storage.objects
for select
using (bucket_id = 'images');
```
### 4) Ejecutar proyecto
```
npm install
npm run dev
```

## Estructura
- `app/` rutas publicas
- `components/` UI reutilizable
- `lib/` clientes Supabase, helpers y validaciones
- `supabase/` SQL maestro para base de datos

## Fallback de links de delivery
Se resuelve en este orden:
1. URL del producto
2. URL de la categoria
3. URL global en `site_settings`

Edita `site_settings` directamente en Supabase para cambiar links y redes.

## Apariencia (colores/logo)
Los colores y textos del header/footer se leen desde `site_settings` (columnas como `top_bar_bg`, `header_bg`, `accent_color`, `footer_bg`, etc). Puedes editar esos campos en Supabase para ajustar el look sin redeploy.

## Email (TODO)
El envio de correo esta listo para integracion. Busca el comentario `TODO` en `components/ClaimForm.tsx`.

## Deploy
- Vercel: agrega las variables de entorno y deploy directo.
- Netlify: mismo setup de variables y build `npm run build`.

## Comandos
```
npm install
npm run dev
```

## Guia rapida de revision
- app/: rutas publicas (categorias, categoria, producto, legal)
- components/: UI publica reutilizable
- lib/: data, tipos y clientes Supabase
- supabase/: SQL maestro
- .env.local: variables de entorno
