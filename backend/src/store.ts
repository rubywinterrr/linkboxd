import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DatabaseState } from "./models.js";

export const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY ?? path.join(process.cwd(), "data"),
);
const databasePath = path.join(dataDirectory, "db.json");

function emptyDatabase(): DatabaseState {
  return {
    users: [],
    projects: [],
    favorites: [],
    ratings: [],
    reviews: [],
    sessions: [],
  };
}

function isDatabaseState(value: unknown): value is DatabaseState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return [
    "users",
    "projects",
    "favorites",
    "ratings",
    "reviews",
    "sessions",
  ].every((key) => Array.isArray(record[key]));
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class JsonStore {
  private state = emptyDatabase();
  private writes = Promise.resolve();

  async initialize(): Promise<void> {
    await mkdir(dataDirectory, { recursive: true });

    try {
      const contents = await readFile(databasePath, "utf8");
      const parsed: unknown = JSON.parse(contents);
      if (!isDatabaseState(parsed)) {
        throw new Error("El archivo de datos no tiene el formato esperado");
      }
      this.state = parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.persist(emptyDatabase());
      this.state = emptyDatabase();
    }
  }

  read<T>(reader: (snapshot: DatabaseState) => T): T {
    return reader(clone(this.state));
  }

  async update<T>(writer: (draft: DatabaseState) => T | Promise<T>): Promise<T> {
    const operation = this.writes.then(async () => {
      const draft = clone(this.state);
      const result = await writer(draft);
      await this.persist(draft);
      this.state = draft;
      return result;
    });

    this.writes = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async persist(state: DatabaseState): Promise<void> {
    const temporaryPath = `${databasePath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    try {
      await rename(temporaryPath, databasePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }
}

export const store = new JsonStore();
