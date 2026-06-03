# Sherry Studio — Guía de configuración (paso a paso)

Esta guía es para configurar el backend (Supabase) del panel de administración.
Sigue los pasos **en orden**. No necesitas saber programar. Cada paso indica
exactamente dónde hacer clic.

---

## Paso 1 — Crear el proyecto en Supabase (gratis)

1. Entra a https://supabase.com y haz clic en **Start your project** / **Sign in**.
   Inicia sesión con GitHub o con tu correo.
2. En el panel, haz clic en el botón verde **New project**.
3. Rellena el formulario:
   - **Name (Nombre):** `sherry-studio`
   - **Database Password (Contraseña de base de datos):** haz clic en
     **Generate a password** y **CÓPIALA Y GUÁRDALA** en un lugar seguro
     (la necesitarás si alguna vez restauras la base de datos). Ejemplo: guárdala
     en tus notas o gestor de contraseñas.
   - **Region (Región):** elige **East US (North Virginia)** o la más cercana a
     México (por ejemplo `West US` o `East US`).
4. Haz clic en **Create new project**. Espera 1–2 minutos a que aparezca el
   panel del proyecto (verás "Setting up project...").

---

## Paso 2 — Crear las tablas y datos (SQL)

Vas a ejecutar **3 archivos en este orden exacto**:
`0001_schema.sql`, luego `0002_rls.sql`, luego `seed.sql`.

Para cada archivo:

1. En el menú izquierdo de Supabase, haz clic en el icono **SQL Editor**
   (parece `</>` o dice "SQL Editor").
2. Haz clic en **+ New query** (arriba a la izquierda).
3. Abre el archivo correspondiente de la carpeta `supabase/` del proyecto
   (con el Bloc de notas o tu editor), **selecciona todo el texto**
   (Ctrl+A), **cópialo** (Ctrl+C).
4. **Pega** (Ctrl+V) dentro del recuadro de la consulta en Supabase.
5. Haz clic en el botón **Run** (abajo a la derecha, o presiona Ctrl+Enter).
6. Debe decir **Success. No rows returned** (o similar). Si hay un error, NO
   continúes: avísale a quien configura el proyecto.

Repite para los 3 archivos **en este orden**:

| Orden | Archivo                              | Qué hace                          |
|-------|--------------------------------------|-----------------------------------|
| 1     | `supabase/migrations/0001_schema.sql`| Crea todas las tablas e índices.  |
| 2     | `supabase/migrations/0002_rls.sql`   | Activa la seguridad (RLS).        |
| 3     | `supabase/seed.sql`                  | Carga el contenido inicial.       |

> Importante: si ejecutas un archivo dos veces verás errores de "ya existe".
> Es normal; solo ejecútalos una vez cada uno, en orden.

---

## Paso 3 — Crear el usuario de acceso al panel (Valery)

1. En el menú izquierdo, haz clic en **Authentication**.
2. Haz clic en la pestaña **Users**.
3. Haz clic en **Add user** → **Create new user**.
4. Rellena:
   - **Email:** `valery@sherry.local`
   - **Password:** `valery`
   - **MARCA la casilla "Auto Confirm User"** (Confirmar usuario
     automáticamente). Esto es importante o no podrá iniciar sesión.
5. Haz clic en **Create user**.

> ⚠️ **SEGURIDAD:** la contraseña `valery` es solo para empezar. **Cámbiala por
> una contraseña fuerte antes de usar el panel en producción.** Para cambiarla:
> Authentication → Users → clic en el usuario → Reset password / Update.

---

## Paso 4 — Crear el bucket de almacenamiento (fotos)

1. En el menú izquierdo, haz clic en **Storage**.
2. Haz clic en **New bucket**.
3. **Name:** escribe `media`
4. Activa la opción **Public bucket** (bucket público).
5. Haz clic en **Create bucket** / **Save**.

---

## Paso 5 — Obtener las llaves (URL y anon key)

1. En el menú izquierdo, haz clic en **Settings** (engranaje) → **API**.
2. Verás dos datos que necesitas:
   - **Project URL** (ej. `https://abcdefgh.supabase.co`)
   - **Project API keys → anon public** (una cadena larga que empieza con `eyJ...`)

### Dónde van esos valores

**a) En tu computadora (para desarrollo local):**

1. En la carpeta del proyecto, copia el archivo `.env.example` y renómbralo a
   `.env`.
2. Ábrelo y pega los valores:
   ```
   PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_anon_key...
   ```
3. Guarda. (El archivo `.env` ya está ignorado por Git: nunca se sube.)

**b) En GitHub (para que el sitio se construya automáticamente — CI):**

1. Ve al repositorio en GitHub: `https://github.com/Darkjor/SherryLanding`
2. Haz clic en **Settings** (del repositorio, arriba a la derecha).
3. En el menú izquierdo: **Secrets and variables** → **Actions**.
4. Haz clic en **New repository secret** y crea estos dos:
   - **Name:** `PUBLIC_SUPABASE_URL` → **Secret:** la Project URL.
   - **Name:** `PUBLIC_SUPABASE_ANON_KEY` → **Secret:** la anon key.
   (Crea uno, guarda, y repite para el segundo.)

---

## Paso 6 (OPCIONAL) — Botón "Publicar" (reconstruir el sitio)

Esto permite que, al editar contenido en el panel, un botón vuelva a publicar el
sitio. Requiere desplegar la Edge Function `publish`.

### 6.1 — Crear un token de GitHub (PAT fine-grained)

1. En GitHub: clic en tu foto (arriba derecha) → **Settings**.
2. Menú izquierdo abajo: **Developer settings**.
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
4. Configura:
   - **Token name:** `sherry-publish`
   - **Expiration:** elige 90 días o más.
   - **Repository access:** **Only select repositories** → elige
     `Darkjor/SherryLanding`.
   - **Permissions** → **Repository permissions** → busca **Actions** y ponlo en
     **Read and write**.
5. Clic **Generate token** y **COPIA el token** (empieza con `github_pat_...`).
   Solo se muestra una vez.

### 6.2 — Desplegar la función y poner los secretos

Esto requiere la **Supabase CLI** (en una terminal, en la carpeta del proyecto):

```bash
# Instalar/iniciar sesión (una sola vez)
supabase login

# Enlazar tu proyecto (te pedirá el "Reference ID", está en Settings -> General)
supabase link --project-ref TU_REFERENCE_ID

# Guardar los secretos (NO se commitean a Git)
supabase secrets set GITHUB_TOKEN=github_pat_xxxxxxxx
supabase secrets set GITHUB_REPO=Darkjor/SherryLanding

# Desplegar la función
supabase functions deploy publish
```

> `SUPABASE_URL` y `SUPABASE_ANON_KEY` los inyecta Supabase automáticamente en la
> función; no hace falta configurarlos.

---

## SEGURIDAD (léelo)

- ✅ La **anon key** (`PUBLIC_SUPABASE_ANON_KEY`) es **pública por diseño**. Se
  incrusta en el sitio y es seguro exponerla. Lo que protege tus datos es **RLS**
  (las reglas del archivo `0002_rls.sql`), no el secreto de la llave.
- ❌ La **service_role key** (Settings → API → `service_role`) **NUNCA** debe ir
  en el frontend, en `.env` del sitio, ni commitearse. Bypasea toda la seguridad.
- ❌ El **GITHUB_TOKEN** **NUNCA** va en código del frontend ni se sube a Git.
  Solo vive como secreto en Supabase (Edge Function).
- 🔑 Cambia la contraseña del usuario `valery` antes de ir a producción.
