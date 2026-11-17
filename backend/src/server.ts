import app from "./app.js";
import { store } from "./store.js";

const port = Number(process.env.PORT ?? 4000);

await store.initialize();

const server = app.listen(port, () => {
  console.log(`LinkBoxd API escuchando en http://localhost:${port}/api/v1`);
});

function shutdown(signal: string): void {
  console.log(`${signal}: cerrando servidor...`);
  server.close((error) => {
    if (error) {
      console.error("No se pudo cerrar el servidor correctamente:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
