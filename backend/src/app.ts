import "dotenv/config";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ZodError } from "zod";
import type {
  DatabaseState,
  ProjectDocument,
  PublicUser,
  ReviewDocument,
  UserDocument,
} from "./models.js";
import {
  createId,
  createSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./security.js";
import { store } from "./store.js";
import {
  loginSchema,
  parseOrThrow,
  projectSchema,
  ratingSchema,
  registerSchema,
  reviewSchema,
} from "./validation.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const app = express();
const API_PREFIX = "/api/v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const mediosEmails = new Set(
  (process.env.MEDIOS_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLocaleLowerCase())
    .filter(Boolean),
);

class ApiError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
    }
}

function notFound(resource: string): ApiError {
    return new ApiError(404, `${resource} no encontrado`);
}

app.disable("x-powered-by");
app.use((req, res, next) => {
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json({ limit: "1mb" }));

function publicUser(user: UserDocument, includePrivate = false): PublicUser {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    nombreUsuario: user.nombreUsuario,
    tipo: user.tipo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: includePrivate
      ? user.profile
      : { ...user.profile, phone: null },
    ...(includePrivate ? { email: user.email } : {}),
  };
}

function getUser(state: DatabaseState, userId: string): UserDocument {
  const user = state.users.find((item) => item.id === userId);
  if (!user) throw notFound("Usuario");
  return user;
}

function getProject(state: DatabaseState, projectId: string): ProjectDocument {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) throw notFound("Proyecto");
  return project;
}

function findUser(state: DatabaseState, identifier: string): UserDocument | undefined {
  const normalized = identifier.trim().toLocaleLowerCase();
  return state.users.find(
    (user) =>
      user.nombreUsuario.toLocaleLowerCase() === normalized ||
      user.email.toLocaleLowerCase() === normalized ||
      user.id === identifier,
  );
}

async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  await authenticate(req);
  next();
}

async function authenticate(req: Request): Promise<void> {
  const authorization = req.header("authorization");
  const token = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
  if (!token) throw new ApiError(401, "Iniciá sesión para continuar");

  const tokenHash = hashToken(token);
  const session = store.read((state) =>
    state.sessions.find(
      (item) => item.tokenHash === tokenHash && Date.parse(item.expiresAt) > Date.now(),
    ),
  );
  if (!session) throw new ApiError(401, "La sesión no es válida o expiró");
  req.userId = session.userId;
}

function currentUserId(req: Request): string {
  if (!req.userId) throw new ApiError(401, "Iniciá sesión para continuar");
  return req.userId;
}

function routeParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== "string") {
    throw new ApiError(400, "Parámetro de ruta inválido");
  }
  return value;
}

function projectStats(state: DatabaseState, projectId: string) {
  const ratings = state.ratings.filter((item) => item.projectId === projectId);
  const reviews = state.reviews.filter((item) => item.projectId === projectId);
  const histogram = [1, 2, 3, 4, 5].map(
    (value) => ratings.filter((item) => item.value === value).length,
  );
  return {
    ratingAverage: ratings.length
      ? Math.round((ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length) * 10) / 10
      : 0,
    ratingCount: ratings.length,
    ratingHistogram: histogram,
    reviewCount: reviews.length,
    favoriteCount: state.favorites.filter((item) => item.projectId === projectId).length,
  };
}

function reviewView(state: DatabaseState, review: ReviewDocument) {
  return { ...review, user: publicUser(getUser(state, review.userId)) };
}

function sessionResponse(user: UserDocument, token: string) {
  return { token, user: publicUser(user, true) };
}

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.json({ status: "ok" });
});

app.get(API_PREFIX, (_req, res) => {
  res.json({
    baseUrl: API_PREFIX,
    routes: [
      { method: "GET", path: "/health", access: "public" },
      { method: "POST", path: "/auth/register", access: "public" },
      { method: "POST", path: "/auth/login", access: "public" },
      { method: "POST", path: "/auth/logout", access: "token" },
      { method: "GET", path: "/auth/me", access: "token" },
      { method: "GET", path: "/users?q=texto&type=medios", access: "token" },
      { method: "GET", path: "/users/:userId", access: "public" },
      { method: "GET", path: "/users/:userId/reviews", access: "public" },
      { method: "GET", path: "/users/me/favorites", access: "token" },
      { method: "GET", path: "/projects", access: "public" },
      { method: "POST", path: "/projects", access: "medios token" },
      { method: "GET", path: "/projects/:projectId", access: "public" },
      { method: "PUT", path: "/projects/:projectId/favorite", access: "token" },
      { method: "DELETE", path: "/projects/:projectId/favorite", access: "token" },
      { method: "PUT", path: "/projects/:projectId/rating", access: "token" },
      { method: "GET", path: "/projects/:projectId/reviews", access: "public" },
      { method: "POST", path: "/projects/:projectId/reviews", access: "token" },
    ],
  });
});

app.post(`${API_PREFIX}/auth/register`, async (req, res) => {
  const input = parseOrThrow(registerSchema, req.body);
  const email = input.email.trim().toLocaleLowerCase();
  const nombreUsuario = input.nombreUsuario.trim();
  const now = new Date().toISOString();
  const token = createSessionToken();
  const user: UserDocument = {
    id: createId("usr"),
    nombre: input.nombre,
    apellido: input.apellido,
    nombreUsuario,
    email,
    passwordHash: await hashPassword(input.password),
    tipo: mediosEmails.has(email) ? "medios" : "outsider",
    profile: {
      bio: "",
      year: null,
      specialty: "",
      phone: input.telefono || null,
      tools: [],
      experiences: [],
    },
    createdAt: now,
    updatedAt: now,
  };

  await store.update((state) => {
    if (state.users.some(
      (existing) =>
        existing.email.toLocaleLowerCase() === email ||
        existing.nombreUsuario.toLocaleLowerCase() === nombreUsuario.toLocaleLowerCase(),
    )) {
      throw new ApiError(409, "El correo o nombre de usuario ya está registrado");
    }
    state.users.push(user);
    state.sessions.push({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    });
  });
  res.status(201).json(sessionResponse(user, token));
});

app.post(`${API_PREFIX}/auth/login`, async (req, res) => {
  const input = parseOrThrow(loginSchema, req.body);
  const identifier = input.identificador ?? input.nombreUser ?? input.email ?? "";
  const user = store.read((state) => findUser(state, identifier));
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "Usuario/correo o contraseña incorrectos");
  }

  const token = createSessionToken();
  await store.update((state) => {
    const now = Date.now();
    state.sessions = state.sessions.filter((session) => Date.parse(session.expiresAt) > now);
    state.sessions.push({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });
  });
  res.json(sessionResponse(user, token));
});

app.post(`${API_PREFIX}/auth/logout`, requireAuth, async (req, res) => {
  const authorization = req.header("authorization") ?? "";
  const token = authorization.slice("Bearer ".length);
  const tokenHash = hashToken(token);
  await store.update((state) => {
    state.sessions = state.sessions.filter((session) => session.tokenHash !== tokenHash);
  });
  res.status(204).end();
});

app.get(`${API_PREFIX}/auth/me`, requireAuth, (req, res) => {
  const user = store.read((state) => getUser(state, currentUserId(req)));
  res.json({ user: publicUser(user, true) });
});

app.get(`${API_PREFIX}/users`, requireAuth, (req, res) => {
  const query = String(req.query.q ?? "").trim().toLocaleLowerCase();
  const type = req.query.type === "medios" ? "medios" : null;
  const users = store.read((state) =>
    state.users
      .filter((user) =>
        user.id !== currentUserId(req) &&
        (!type || user.tipo === type) &&
        (!query || user.nombreUsuario.toLocaleLowerCase().includes(query)),
      )
      .slice(0, 50)
      .map((user) => ({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        nombreUsuario: user.nombreUsuario,
        tipo: user.tipo,
      })),
  );
  res.json({ data: users });
});

function resolveProfile(state: DatabaseState, key: string): UserDocument {
  const user = findUser(state, key);
  if (!user) throw notFound("Usuario");
  return user;
}

app.get(`${API_PREFIX}/users/:userId`, (req, res) => {
  const viewerId = req.header("authorization")?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
  const viewerSession = viewerId
    ? store.read((state) =>
      state.sessions.find(
        (session) =>
          session.tokenHash === hashToken(viewerId) &&
          Date.parse(session.expiresAt) > Date.now(),
      ),
    )
    : undefined;
  const user = store.read((state) => resolveProfile(state, routeParam(req, "userId")));
  const isOwner = viewerSession?.userId === user.id;
  res.json({
    user: publicUser(user, isOwner),
    projects: store.read((state) =>
      state.projects
        .filter((project) =>
          project.publicadoPor === user.id ||
          project.equipo.some((member) => member.userId === user.id),
        )
        .map((project) => ({ ...project, ...projectStats(state, project.id) })),
    ),
  });
});

app.get(`${API_PREFIX}/users/:userId/reviews`, (req, res) => {
  const data = store.read((state) => {
    const user = resolveProfile(state, routeParam(req, "userId"));
    return state.reviews
      .filter((review) => review.userId === user.id)
      .map((review) => ({
        ...reviewView(state, review),
        project: getProject(state, review.projectId),
      }));
  });
  res.json({ data });
});

app.get(`${API_PREFIX}/projects`, (req, res) => {
  const query = String(req.query.q ?? "").trim().toLocaleLowerCase();
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const sort = String(req.query.sort ?? "recent");
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const result = store.read((state) => {
    let projects = state.projects.filter((project) =>
      (!type || project.tipo.toLocaleLowerCase() === type.toLocaleLowerCase()) &&
      (!query ||
        project.titulo.toLocaleLowerCase().includes(query) ||
        project.descripcion.toLocaleLowerCase().includes(query)),
    );
    if (sort === "rating") {
      projects = projects.sort(
        (a, b) => projectStats(state, b.id).ratingAverage - projectStats(state, a.id).ratingAverage,
      );
    } else {
      projects = projects.sort((a, b) =>
        sort === "popular"
          ? projectStats(state, b.id).favoriteCount - projectStats(state, a.id).favoriteCount
          : b.createdAt.localeCompare(a.createdAt),
      );
    }
    const total = projects.length;
    return {
      data: projects.slice((page - 1) * limit, page * limit)
        .map((project) => ({ ...project, ...projectStats(state, project.id) })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  });
  res.json(result);
});

app.post(`${API_PREFIX}/projects`, requireAuth, async (req, res) => {
  const input = parseOrThrow(projectSchema, req.body);
  const authorId = currentUserId(req);
  const project = await store.update((state) => {
    const author = getUser(state, authorId);
    if (author.tipo !== "medios") {
      throw new ApiError(403, "Solo usuarios de Medios pueden publicar proyectos");
    }
    for (const member of input.equipo) {
      const teammate = getUser(state, member.userId);
      if (teammate.tipo !== "medios") {
        throw new ApiError(422, "El equipo solo puede incluir usuarios de Medios");
      }
    }
    const now = new Date().toISOString();
    const team = [...input.equipo];
    if (!team.some((member) => member.userId === authorId)) {
      team.push({ userId: authorId, roles: ["Autor"], comment: "" });
    }
    const created: ProjectDocument = {
      ...input,
      id: createId("prj"),
      publicadoPor: authorId,
      equipo: team,
      createdAt: now,
      updatedAt: now,
    };
    state.projects.push(created);
    return created;
  });
  res.status(201).json({ project });
});

app.get(`${API_PREFIX}/projects/:projectId`, (req, res) => {
  const authorizationToken = req.header("authorization")?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
  const viewer = authorizationToken
    ? store.read((state) =>
      state.sessions.find(
        (session) =>
          session.tokenHash === hashToken(authorizationToken) &&
          Date.parse(session.expiresAt) > Date.now(),
      )?.userId,
    )
    : undefined;
  const result = store.read((state) => {
    const project = getProject(state, routeParam(req, "projectId"));
    return {
      project,
      author: publicUser(getUser(state, project.publicadoPor)),
      team: project.equipo.map((member) => ({
        ...member,
        user: publicUser(getUser(state, member.userId)),
      })),
      ...projectStats(state, project.id),
      isFavorite: viewer
        ? state.favorites.some((item) => item.userId === viewer && item.projectId === project.id)
        : false,
      myRating: viewer
        ? state.ratings.find((item) => item.userId === viewer && item.projectId === project.id)?.value ?? null
        : null,
    };
  });
  res.json(result);
});

app.put(`${API_PREFIX}/projects/:projectId/favorite`, requireAuth, async (req, res) => {
  const userId = currentUserId(req);
  const projectId = routeParam(req, "projectId");
  await store.update((state) => {
    getProject(state, projectId);
    if (!state.favorites.some((item) => item.userId === userId && item.projectId === projectId)) {
      state.favorites.push({ userId, projectId, createdAt: new Date().toISOString() });
    }
  });
  res.status(204).end();
});

app.delete(`${API_PREFIX}/projects/:projectId/favorite`, requireAuth, async (req, res) => {
  const userId = currentUserId(req);
  const projectId = routeParam(req, "projectId");
  await store.update((state) => {
    getProject(state, projectId);
    state.favorites = state.favorites.filter(
      (item) => item.userId !== userId || item.projectId !== projectId,
    );
  });
  res.status(204).end();
});

app.put(`${API_PREFIX}/projects/:projectId/rating`, requireAuth, async (req, res) => {
  const { value } = parseOrThrow(ratingSchema, req.body);
  const userId = currentUserId(req);
  const projectId = routeParam(req, "projectId");
  const rating = await store.update((state) => {
    getProject(state, projectId);
    const existing = state.ratings.find(
      (item) => item.userId === userId && item.projectId === projectId,
    );
    let saved;
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date().toISOString();
      saved = existing;
    } else {
      saved = { userId, projectId, value, updatedAt: new Date().toISOString() };
      state.ratings.push(saved);
    }
    return saved;
  });
  res.json({ rating });
});

app.get(`${API_PREFIX}/projects/:projectId/reviews`, (req, res) => {
  const data = store.read((state) => {
    const projectId = routeParam(req, "projectId");
    getProject(state, projectId);
    return state.reviews
      .filter((review) => review.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((review) => reviewView(state, review));
  });
  res.json({ data });
});

app.post(`${API_PREFIX}/projects/:projectId/reviews`, requireAuth, async (req, res) => {
  const input = parseOrThrow(reviewSchema, req.body);
  const review = await store.update((state) => {
    const project = getProject(state, routeParam(req, "projectId"));
    const now = new Date().toISOString();
    const created: ReviewDocument = {
      id: createId("rev"),
      projectId: project.id,
      userId: currentUserId(req),
      value: input.value,
      text: input.text,
      createdAt: now,
      updatedAt: now,
    };
    state.reviews.push(created);
    return created;
  });
  res.status(201).json({ review });
});

app.use((_req, _res, next) => next(notFound("Ruta")));

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (res.headersSent) {
    _next(error);
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(
      error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
    );
    res.status(422).json({
      error: { message: "Revisá los datos enviados", fields },
    });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: { message: "El cuerpo de la solicitud no es JSON válido" },
    });
    return;
  }
  console.error("Error interno del backend:", error);
  res.status(500).json({
    error: { message: "Ocurrió un error interno" },
  });
};

app.use(errorHandler);

export default app;
