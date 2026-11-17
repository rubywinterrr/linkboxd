# LinkBoxd: guía para conectar el frontend

Este documento es la guía de integración entre el frontend y el backend. El frontend todavía no llama a la API; el equipo puede usar los contratos de abajo para empezar esa conexión sin cambiar la estructura de datos del servidor.

## 1. Iniciar el servidor

Desde PowerShell, en la carpeta `backend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La dirección local es `http://localhost:4000/api/v1`. Para saber si funciona, abrir `GET http://localhost:4000/api/v1/health`. Para ver la lista que publica el mismo servidor, abrir `GET http://localhost:4000/api/v1`.

El correo de una cuenta solo obtiene el tipo `medios` si se encuentra en `MEDIOS_EMAILS` del archivo `backend/.env`; los demás registros son `outsider`. No enviar el tipo desde el frontend.

## 2. Conexión desde React

Definir la dirección de la API una sola vez (en desarrollo, `http://localhost:4000/api/v1`). Para llamadas autenticadas, leer el token devuelto por login/registro y mandarlo como `Authorization: Bearer <token>`.

```ts
const API = "http://localhost:4000/api/v1";
const token = localStorage.getItem("token");

const response = await fetch(`${API}/projects`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

if (!response.ok) {
  const result = await response.json();
  throw new Error(result.error?.message ?? "No se pudo completar la solicitud");
}

const result = await response.json();
```

Para solicitudes `POST` o `PUT` con JSON, agregar `Content-Type: application/json` y `body: JSON.stringify(datos)`. Logout y operaciones que devuelven `204` no tienen cuerpo JSON. No configurar `mode: "no-cors"`.

## 3. Rutas disponibles

Todas las rutas usan el prefijo `http://localhost:4000/api/v1`. `:userId` acepta el ID o el nombre de usuario. `:projectId` es el ID devuelto al crear el proyecto.

| Método | Ruta | Acceso | Para qué sirve |
|---|---|---|---|
| `GET` | `/` | Público | Índice JSON de rutas disponibles |
| `GET` | `/health` | Público | Comprobar que la API responde |
| `POST` | `/auth/register` | Público | Registrar e iniciar sesión |
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `POST` | `/auth/logout` | Token | Cerrar la sesión actual |
| `GET` | `/auth/me` | Token | Obtener la cuenta de la sesión |
| `GET` | `/users?q=texto&type=medios` | Token | Buscar compañeros; los parámetros son opcionales |
| `GET` | `/users/:userId` | Público | Ver perfil y proyectos |
| `GET` | `/users/:userId/reviews` | Público | Ver las reseñas escritas por un usuario |
| `GET` | `/users/me/favorites` | Token | Ver los proyectos favoritos propios |
| `GET` | `/projects?type=Cortometraje&q=texto&sort=recent&page=1&limit=20` | Público | Explorar, filtrar y paginar proyectos |
| `POST` | `/projects` | Token Medios | Publicar un proyecto |
| `GET` | `/projects/:projectId` | Público | Ver detalle, equipo, promedio, favoritos y puntaje propio |
| `PUT` | `/projects/:projectId/favorite` | Token | Agregar a favoritos |
| `DELETE` | `/projects/:projectId/favorite` | Token | Quitar de favoritos |
| `PUT` | `/projects/:projectId/rating` | Token | Crear o cambiar el puntaje propio |
| `GET` | `/projects/:projectId/reviews` | Público | Ver reseñas, primero las más recientes |
| `POST` | `/projects/:projectId/reviews` | Token | Publicar una reseña |

El servidor también muestra todas sus rutas en `GET /api/v1`. Los parámetros de `GET /projects` son `type`, `q`, `sort` (`recent`, `popular` o `rating`), `page` y `limit` (máximo 50).

## 4. Datos para enviar y respuestas

### Registrar cuenta

`POST /auth/register`

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "nombreUsuario": "ana.perez",
  "email": "ana@example.com",
  "password": "una-clave-segura",
  "telefono": "1112345678"
}
```

Respuesta `201`: `{ "token": "...", "user": { ... } }`. El usuario incluye `id`, `nombre`, `apellido`, `nombreUsuario`, `tipo`, `profile` y correo. No incluye contraseña ni hash.

### Iniciar sesión

`POST /auth/login`

```json
{ "identificador": "ana.perez", "password": "una-clave-segura" }
```

También se acepta `nombreUser` en lugar de `identificador`, o `email`. Respuesta `200`: mismo formato que registro. Guardar `token` para llamadas autenticadas; al cerrar sesión quitarlo del almacenamiento del frontend.

### Cerrar sesión y obtener cuenta actual

- `POST /auth/logout`: requiere token; devuelve `204` sin contenido.
- `GET /auth/me`: requiere token; devuelve `{ "user": { ... } }`.

### Buscar compañeros

`GET /users?q=ana&type=medios`: requiere token. Devuelve `{ "data": [...] }`, con IDs y nombres, sin correos ni contraseñas. `type=medios` limita la búsqueda a alumnos de Medios.

### Consultar perfil

`GET /users/:userId`: respuesta `{ "user": { ... }, "projects": [...] }`. Los perfiles públicos no incluyen correo y ocultan teléfono. El propietario puede enviar su token para obtener su propio correo y teléfono.

`GET /users/:userId/reviews`: respuesta `{ "data": [...] }`.

`GET /users/me/favorites`: requiere token; respuesta `{ "data": [proyectos...] }`.

### Explorar proyectos

`GET /projects` devuelve:

```json
{
  "data": [
    {
      "id": "prj_...",
      "titulo": "Corto de ejemplo",
      "tipo": "Cortometraje",
      "anio": 2025,
      "genero": "Drama",
      "duracionMinutos": 14,
      "descripcion": "Descripción",
      "url": "https://example.com/video",
      "imagen": null,
      "publicadoPor": "usr_...",
      "equipo": [],
      "ratingAverage": 0,
      "ratingCount": 0,
      "ratingHistogram": [0, 0, 0, 0, 0],
      "reviewCount": 0,
      "favoriteCount": 0
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

### Publicar proyecto

`POST /projects`, requiere sesión de Medios:

```json
{
  "titulo": "Corto de ejemplo",
  "tipo": "Cortometraje",
  "anio": 2025,
  "genero": "Drama",
  "duracionMinutos": 14,
  "descripcion": "Descripción del proyecto",
  "url": "https://example.com/video",
  "imagen": null,
  "equipo": [
    {
      "userId": "usr_id_de_companero",
      "roles": ["Sonido"],
      "comment": ""
    }
  ]
}
```

Valores permitidos para `tipo`: `Cortometraje`, `Podcast y radio`, `Session Bis`, `Cross Media`, `Animación`, `Documental`, `Otro`. `equipo`, `genero`, `duracionMinutos` e `imagen` son opcionales. El backend agrega automáticamente al autor como integrante si no está en el equipo. Respuesta `201`: `{ "project": { ... } }`.

### Ver detalle

`GET /projects/:projectId`: devuelve `project`, `author`, `team`, `ratingAverage`, `ratingCount`, `ratingHistogram`, `reviewCount`, `favoriteCount`, `isFavorite` y `myRating`. Si no se manda token, `isFavorite` es `false` y `myRating` es `null`.

### Favoritos y calificaciones

- `PUT /projects/:projectId/favorite`: agrega el favorito. Devuelve `204`.
- `DELETE /projects/:projectId/favorite`: lo quita. Devuelve `204`.
- `PUT /projects/:projectId/rating`: cuerpo `{ "value": 4 }`, valor entero de 1 a 5. Devuelve `{ "rating": { ... } }`. Cada usuario tiene una sola calificación por proyecto; enviar otra la cambia.

### Reseñas

- `GET /projects/:projectId/reviews`: devuelve `{ "data": [...] }`.
- `POST /projects/:projectId/reviews`: cuerpo `{ "value": 5, "text": "Me gustó mucho" }`; puntaje entero de 1 a 5. Devuelve `201` y `{ "review": { ... } }`.

## 5. Errores que puede mostrar la interfaz

Los errores siguen este formato:

```json
{ "error": { "message": "Revisá los datos enviados", "fields": { "email": "..." } } }
```

`fields` aparece cuando hay campos inválidos. Códigos HTTP principales: `400` solicitud mal formada, `401` sesión faltante/incorrecta, `403` sin permiso, `404` recurso inexistente, `409` correo o usuario repetido, `422` validación. Para mostrar errores, leer `error.message`; no hace falta usar códigos internos.

## 6. Para entender `dist`

El código que se edita está en `backend/src/` y está escrito en TypeScript. `npm run build` lo convierte a JavaScript y guarda el resultado en `backend/dist/`. `npm start` ejecuta `dist/server.js`; por eso primero hay que compilar. En desarrollo, `npm run dev` ejecuta el TypeScript directamente y no necesita compilar a mano. `dist` es un archivo generado: no editarlo ni subirlo a Git.

## 7. Datos y alcance

El JSON se crea en `backend/data/db.json`; contiene `users`, `projects`, `favorites`, `ratings`, `reviews` y `sessions`. Está ignorado por Git. No modificarlo mientras el servidor corre.

En esta versión no hay endpoints para editar perfiles/proyectos, eliminar proyectos, archivos CV, respuestas o “me gusta” de reseñas. Si la interfaz necesita una operación nueva, acuerden el contrato y agréguenlo al backend antes de conectar ese control.

`backend/src/store.ts` sí es necesario: carga `db.json` al arrancar, entrega copias de los datos para las lecturas y guarda los cambios en el archivo para que sigan existiendo al reiniciar. También ordena las escrituras para que dos solicitudes del mismo servidor no se pisen. Las rutas de `app.ts` usan `store.read(...)` para consultar y `store.update(...)` para modificar datos.
