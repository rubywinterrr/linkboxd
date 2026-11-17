# LinkBoxd API

Servidor Express + TypeScript con persistencia JSON.

## Iniciar en desarrollo

Requiere Node.js 20 o superior.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La API inicia en `http://localhost:4000/api/v1`. El índice de endpoints está en `GET /api/v1` y el estado del servicio en `GET /api/v1/health`.

Para compilar y ejecutar como producción:

```powershell
npm run build
npm start
```

## Integrar el frontend

La guía con todas las rutas, permisos, cuerpos JSON y respuestas está en [BACKEND.md](../BACKEND.md).

## Variables opcionales

- `PORT`: puerto, predeterminado `4000`.
- `CORS_ORIGIN`: origen del frontend, predeterminado `http://localhost:5173`.
- `MEDIOS_EMAILS`: correos habilitados para cuentas Medios, separados por coma.
- `DATA_DIRECTORY`: ubicación opcional de `db.json`.

Los datos se guardan en `data/db.json`. No editar mientras el servidor está activo. Este archivo es para desarrollo local, no para varias instancias en producción.
