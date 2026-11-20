# LinkBoxd: guía para conectar el frontend

Guía de los contratos implementados por la API. Todas las rutas usan el prefijo
`http://localhost:4000/api/v1`; `:userId` acepta el ID o el nombre de usuario.

## 1. Iniciar y configurar

Desde PowerShell, en la carpeta `backend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La API escucha en `http://localhost:4000/api/v1`. El frontend usa esa dirección
por defecto; para otro entorno definí `VITE_API_URL` en la raíz del proyecto
(por ejemplo, `VITE_API_URL=https://api.ejemplo.com/api/v1`). `GET /health`
comprueba que responde y `GET /` publica el índice de rutas.

La cuenta se registra como `medios` solo si su correo está en la lista separada
por comas `MEDIOS_EMAILS` de `backend/.env`; los demás registros son `outsider`.
No se acepta el tipo de usuario enviado por el frontend. La lista explícita evita
confiar en un dominio de correo que todavía no se verifica.

Variables disponibles:

| Variable | Uso | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP | `4000` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas | `http://localhost:5173` |
| `PUBLIC_API_URL` | URL pública base que se usa en enlaces de archivos | `http://localhost:4000/api/v1` |
| `MEDIOS_EMAILS` | Correos autorizados como Medios | vacío |
| `DATA_DIRECTORY` | Carpeta de `db.json` | `backend/data` |
| `UPLOADS_DIRECTORY` | Carpeta de CV y portadas | `DATA_DIRECTORY/uploads` |

## 2. Datos de ejemplo

El comando de carga es explícito: no se ejecuta al iniciar el servidor y puede
repetirse sin duplicar usuarios ni proyectos de ejemplo.

1. Agregá `demo.medios@ort.edu.ar` a `MEDIOS_EMAILS` en `backend/.env`.
2. Desde `backend`, definí una contraseña temporal de al menos 8 caracteres y
   ejecutá:

```powershell
$env:SEED_PASSWORD = "cambia-esta-clave"
npm run seed
```

Se crean `martina.sosa` (`demo.medios@ort.edu.ar`) y `lucia.perez`
(`demo.outsider@example.com`), dos proyectos y actividad de ejemplo. Ambas
cuentas usan el valor de `SEED_PASSWORD`; cada ejecución lo vuelve a establecer
para esas cuentas de demostración. No uses una contraseña real ni ejecutes el
seed en una instancia pública.

## 3. Autenticación y solicitudes

Registro y login devuelven un token. En las rutas protegidas se envía así:

```ts
const response = await fetch(`${API}/projects`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});
```

Para JSON, enviar `Content-Type: application/json` y
`body: JSON.stringify(datos)`. Las rutas de archivos reciben `multipart/form-data`
con un campo llamado `file`. No fijes manualmente el `Content-Type` de
`FormData`: el navegador agrega el boundary. Logout y las operaciones `204`
devuelven el cuerpo vacío. No configurar `mode: "no-cors"`.

## 4. Rutas

`Token` indica sesión requerida. `Propietario` o `autor` limita la operación al
dueño del recurso. Las rutas `multipart` reciben el campo `file`.

| Método | Ruta | Acceso | Para qué sirve |
|---|---|---|---|
| `GET` | `/` | Público | Índice JSON de rutas |
| `GET` | `/health` | Público | Estado de la API |
| `POST` | `/auth/register` | Público | Crear cuenta e iniciar sesión |
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `POST` | `/auth/logout` | Token | Cerrar la sesión actual |
| `GET` | `/auth/me` | Token | Obtener la cuenta actual |
| `GET` | `/users?q=texto&type=medios` | Público | Buscar usuarios; ambos parámetros son opcionales |
| `PUT` | `/users/me` | Token | Editar datos del perfil propio |
| `PUT` | `/users/me/cv` | Token Medios, multipart | Subir o reemplazar el CV PDF propio |
| `DELETE` | `/users/me/cv` | Token Medios | Eliminar el CV propio |
| `GET` | `/users/:userId/cv?download=true` | Token | Ver o descargar el CV de un perfil Medios |
| `GET` | `/users/:userId` | Público | Ver perfil y proyectos |
| `GET` | `/users/:userId/reviews` | Público | Ver reseñas escritas por el usuario |
| `GET` | `/users/me/favorites` | Token | Ver los favoritos propios |
| `GET` | `/projects` | Público | Explorar, filtrar y paginar |
| `POST` | `/projects` | Token Medios | Publicar un proyecto |
| `PUT` | `/projects/:projectId` | Token autor | Editar parcialmente el proyecto |
| `DELETE` | `/projects/:projectId` | Token autor | Borrar el proyecto y sus datos asociados |
| `GET` | `/projects/:projectId` | Público | Ver detalle; cada solicitud suma una vista |
| `PUT` | `/projects/:projectId/cover` | Token autor, multipart | Subir o reemplazar la portada |
| `DELETE` | `/projects/:projectId/cover` | Token autor | Quitar la portada cargada como archivo |
| `GET` | `/projects/:projectId/cover` | Público | Obtener la portada cargada |
| `PUT` | `/projects/:projectId/team-comment` | Token integrante | Editar el comentario propio en el equipo |
| `PUT` | `/projects/:projectId/favorite` | Token | Agregar a favoritos |
| `DELETE` | `/projects/:projectId/favorite` | Token | Quitar de favoritos |
| `PUT` | `/projects/:projectId/rating` | Token | Crear o cambiar el puntaje propio |
| `GET` | `/projects/:projectId/reviews` | Público | Ver reseñas, respuestas y “me gusta” |
| `POST` | `/projects/:projectId/reviews` | Token | Publicar una reseña |
| `PUT` | `/reviews/:reviewId` | Token autor | Editar la reseña propia |
| `DELETE` | `/reviews/:reviewId` | Token autor | Borrar la reseña y sus interacciones |
| `PUT` | `/reviews/:reviewId/like` | Token | Marcar “me gusta” (idempotente) |
| `DELETE` | `/reviews/:reviewId/like` | Token | Quitar “me gusta” |
| `POST` | `/reviews/:reviewId/replies` | Token | Responder a una reseña |

### Cuentas, perfiles y privacidad

- Registro: `POST /auth/register` recibe `nombre`, `apellido`,
  `nombreUsuario`, `email`, `password` y `telefono` opcional. Login acepta
  `identificador` (usuario o correo), `nombreUser` o `email`, además de
  `password`.
- `GET /users` devuelve `{ "data": [...] }` con ID, nombres, nombre de usuario y
  tipo; nunca devuelve correos, teléfonos ni contraseñas. Acepta `q` y
  `type=medios`.
- `PUT /users/me` recibe cualquier combinación de `bio`, `year`, `specialty`,
  `phone`, `tools` y `experiences`. Las experiencias usan
  `{ "id"?: "...", "year": 2025, "position": "...", "place": "..." }`; si no se
  envía `id`, el servidor lo genera. Solo se modifican los campos enviados.
- `GET /users/:userId` no expone email ni teléfono al público. El perfil privado
  propio se obtiene con `GET /auth/me`. El endpoint público `GET /users` muestra
  los datos básicos; cuando se llama con sesión, agrega los metadatos y la URL
  de CV para perfiles Medios que tengan uno. `GET /users/:userId` también
  incluye esos metadatos al consultarse con sesión.
- CV: enviar un PDF de hasta 10 MB como `file` a `PUT /users/me/cv`. Cualquier
  usuario con sesión puede ver o descargar el CV de un perfil Medios con
  `GET /users/:userId/cv`, agregando `?download=true` para descargarlo. Sin
  sesión, el CV no se puede ver ni se devuelve su URL; outsider no puede cargar
  un CV.
- Las cuentas Medios se determinan únicamente por `MEDIOS_EMAILS`. Cambiar la
  lista no convierte automáticamente cuentas existentes.

### Proyectos, favoritos y vistas

- `GET /projects` acepta `type`, `q`, `sort` (`recent`, `popular` o `rating`),
  `page` y `limit` (máximo 50). Devuelve `{ "data": [...], "pagination": ... }`.
- `POST /projects` recibe `titulo`, `tipo`, `anio`, `genero`, `duracionMinutos`,
  `descripcion`, `url`, `imagen` (URL externa opcional) y `equipo` opcional.
  Valores permitidos para `tipo`: `Cortometraje`, `Podcast y radio`,
  `Session Bis`, `Cross Media`, `Animación`, `Documental`, `Otro`. El autor se
  agrega automáticamente al equipo; todos sus integrantes deben ser de Medios.
- `PUT /projects/:projectId` acepta parcialmente los campos de creación. Solo el
  autor puede editar o eliminar el proyecto. El servidor conserva los comentarios
  de cada integrante al editar el equipo.
- Portada: `PUT /projects/:projectId/cover` recibe PNG, JPEG o WebP de hasta
  5 MB en `file`. La URL resultante aparece en `project.imagen`. La portada de
  archivo reemplaza visualmente una URL externa mientras exista; al quitarla,
  vuelve a mostrarse la URL externa, si había una. En despliegues, configurar
  `PUBLIC_API_URL` con la URL pública base de la API.
- `GET /projects/:projectId` devuelve `project`, `author`, `team`,
  `ratingAverage`, `ratingCount`, `ratingHistogram`, `reviewCount`,
  `favoriteCount`, `viewCount`, `isFavorite` y `myRating`. Cada solicitud a esta
  ruta incrementa `viewCount`, incluso recargas y consultas sin sesión.
- Cada usuario puede guardar hasta cuatro favoritos. Agregar uno ya guardado no
  cambia nada; intentar agregar un quinto devuelve `409`. Primero quitá uno con
  `DELETE /projects/:projectId/favorite`.
- Cada usuario tiene un puntaje por proyecto; enviar otro valor a la misma ruta
  lo reemplaza.
- `PUT /projects/:projectId/team-comment` recibe `{ "comment": "..." }`. Solo
  el integrante correspondiente puede editar su comentario.

### Reseñas, “me gusta” y respuestas

- Crear una reseña: `POST /projects/:projectId/reviews` con
  `{ "value": 5, "text": "..." }`; valor entre 1 y 5. Solo se permite una reseña
  por usuario y proyecto; el duplicado devuelve `409`.
- `PUT /reviews/:reviewId` recibe el mismo cuerpo para editar puntaje y texto.
  Solo el autor puede editar o borrar su reseña.
- Las respuestas se agregan con `POST /reviews/:reviewId/replies` y
  `{ "text": "..." }`. Las respuestas son comentarios directos de la reseña.
- Marcar y quitar “me gusta” usa `PUT` y `DELETE /reviews/:reviewId/like`.
  Cada usuario cuenta una sola vez. Las reseñas incluyen `likeCount`, `isLiked`
  y `replies`; sin token, `isLiked` es `false`.
- Borrar una reseña elimina también sus “me gusta” y respuestas. Borrar un
  proyecto elimina sus reseñas, puntajes y favoritos.

## 5. Archivos y persistencia

El JSON se guarda en `backend/data/db.json`; los CV y portadas, por defecto, en
`backend/data/uploads/`. Ambas carpetas están ignoradas por Git. En otro entorno
configurá `DATA_DIRECTORY` y `UPLOADS_DIRECTORY` en almacenamiento persistente y
respaldá las dos carpetas. Los nombres almacenados son generados por el servidor;
no se guarda el archivo con el nombre enviado por el usuario.

El store escribe el JSON mediante archivo temporal y serializa las escrituras
dentro de un único proceso. Al iniciar, incorpora valores por defecto para los
nuevos campos y colecciones, por lo que conserva los `db.json` anteriores. No
coordina escrituras entre múltiples instancias ni ofrece las garantías de una
base de datos para despliegues con varios usuarios concurrentes. Para una
publicación real en internet, migrá a una base de datos y a almacenamiento de
archivos duradero antes de escalar.

## 6. Errores y validación

Los errores usan este formato:

```json
{ "error": { "message": "Revisá los datos enviados", "fields": { "email": "..." } } }
```

`fields` aparece cuando falla la validación. Códigos principales: `400`
solicitud mal formada, `401` sesión faltante o vencida, `403` sin permiso,
`404` recurso inexistente, `409` conflicto (por ejemplo, favorito excedido o
reseña duplicada), `413` carga demasiado grande y `422` campos inválidos. Para
mostrar el error, leer `error.message`.

## 7. Compilar y probar

Desde `backend`, `npm run dev` inicia el servidor TypeScript, `npm run build`
compila a `backend/dist/`, `npm start` ejecuta la compilación y `npm test` corre
la comprobación de TypeScript. `dist` es generado: no editarlo ni subirlo a Git.
