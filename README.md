# REFRIGERACIONLOZANO
REFRIGERACION LOZANO

## API de Instagram

Expone las últimas publicaciones de la cuenta de Instagram Business del negocio usando la Instagram Graph API (la Basic Display API fue descontinuada por Meta en diciembre de 2024, así que esta es la única vía oficial).

### 1. Requisitos previos en Meta

1. La cuenta de Instagram debe ser **Business** o **Creator** y estar vinculada a una **Página de Facebook** (ya cumples esto).
2. Crea una app en [Meta for Developers](https://developers.facebook.com/apps) y agrégale el producto **Instagram Graph API**.
3. Obtén el **ID de tu cuenta de Instagram Business** (`IG_USER_ID`): puedes consultarlo con el [Graph API Explorer](https://developers.facebook.com/tools/explorer/) usando `GET /me/accounts` para obtener el ID de la Página, y luego `GET /{page-id}?fields=instagram_business_account`.
4. Genera un **token de acceso de usuario** con los permisos `instagram_basic` y `pages_show_list`, y luego intercámbialo por un **token de larga duración** (dura ~60 días y se puede renovar antes de que expire):
   `GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={token-corto}`

### 2. Configuración local

```bash
npm install
cp .env.example .env
# completa IG_USER_ID e IG_ACCESS_TOKEN en .env
npm start
```

El servidor corre en `http://localhost:3000` por defecto.

### 3. Endpoints

- `GET /api/instagram/posts?limit=6` — devuelve `{ source, posts }` con las últimas publicaciones (`id`, `caption`, `media_type`, `media_url`, `thumbnail_url`, `permalink`, `timestamp`). Las respuestas se cachean 10 minutos para no agotar el límite de peticiones de la Graph API.
- `GET /health` — chequeo simple de salud.

Hay una página de prueba en `public/index.html` que consume el endpoint y muestra las publicaciones en una cuadrícula.

### 4. Nota sobre el token

El token de larga duración expira en ~60 días. Para producción conviene renovarlo periódicamente (por ejemplo con un cron) antes de que caduque, ya que si expira el endpoint dejará de poder consultar la Graph API hasta que generes uno nuevo.
