import "dotenv/config";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import multer from "multer";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ZodError } from "zod";
import type {
  DatabaseState,
  ProjectDocument,
  PublicUser,
  ReviewDocument,
  ReviewReplyDocument,
  StoredFile,
  UserDocument,
} from "./models.js";
import {
  createId,
  createSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./security.js";
import { dataDirectory, store } from "./store.js";
import {
  loginSchema,
  parseOrThrow,
  profileSchema,
  projectSchema,
  projectUpdateSchema,
  ratingSchema,
  registerSchema,
  reviewReplySchema,
  reviewSchema,
  teamCommentSchema,
} from "./validation.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const app = express();
const API_PREFIX = "/api/v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const publicApiUrl = (
  process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}${API_PREFIX}`
).replace(/\/+$/, "");
const uploadsDirectory = path.resolve(
  process.env.UPLOADS_DIRECTORY ?? path.join(dataDirectory, "uploads"),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
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

function publicUser(
  user: UserDocument,
  includePrivate = false,
  canViewCv = false,
): PublicUser {
  const cv = user.tipo === "medios" && (includePrivate || canViewCv) && user.profile.cv
    ? {
      originalName: user.profile.cv.originalName,
      mimeType: user.profile.cv.mimeType,
      size: user.profile.cv.size,
      url: `${publicApiUrl}/users/${encodeURIComponent(user.id)}/cv`,
    }
    : null;
  const profile = { ...user.profile, cv };
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    nombreUsuario: user.nombreUsuario,
    tipo: user.tipo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: includePrivate ? profile : { ...profile, phone: null },
    ...(includePrivate ? { email: user.email } : {}),
  };
}

function publicProject(project: ProjectDocument): Omit<ProjectDocument, "coverFile"> {
  const { coverFile, ...visibleProject } = project;
  void coverFile;
  return {
    ...visibleProject,
    imagen: project.coverFile
      ? `${publicApiUrl}/projects/${project.id}/cover`
      : project.imagen,
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

function optionalUserId(req: Request): string | undefined {
  const token = req.header("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return undefined;
  return store.read((state) =>
    state.sessions.find(
      (session) =>
        session.tokenHash === hashToken(token) && Date.parse(session.expiresAt) > Date.now(),
    )?.userId,
  );
}

function routeParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== "string") {
    throw new ApiError(400, "Parámetro de ruta inválido");
  }
  return value;
}

function projectStats(state: DatabaseState, projectId: string) {
  const project = state.projects.find((item) => item.id === projectId);
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
    viewCount: project?.views ?? 0,
  };
}

function reviewView(state: DatabaseState, review: ReviewDocument, viewerId?: string) {
  const replies = state.reviewReplies
    .filter((reply) => reply.reviewId === review.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((reply) => ({
      ...reply,
      user: publicUser(getUser(state, reply.userId)),
    }));
  return {
    ...review,
    user: publicUser(getUser(state, review.userId)),
    likeCount: state.reviewLikes.filter((like) => like.reviewId === review.id).length,
    isLiked: viewerId
      ? state.reviewLikes.some((like) => like.reviewId === review.id && like.userId === viewerId)
      : false,
    replies,
  };
}

function sessionResponse(user: UserDocument, token: string) {
  return { token, user: publicUser(user, true) };
}

function assertProjectAuthor(project: ProjectDocument, userId: string): void {
  if (project.publicadoPor !== userId) {
    throw new ApiError(403, "Solo quien publicó el proyecto puede modificarlo");
  }
}

function assertMedios(user: UserDocument): void {
  if (user.tipo !== "medios") {
    throw new ApiError(403, "Solo usuarios de Medios pueden realizar esta operación");
  }
}

function requireMedios(req: Request, _res: Response, next: NextFunction): void {
  assertMedios(store.read((state) => getUser(state, currentUserId(req))));
  next();
}

function requireProjectAuthor(req: Request, _res: Response, next: NextFunction): void {
  const project = store.read((state) => getProject(state, routeParam(req, "projectId")));
  assertProjectAuthor(project, currentUserId(req));
  next();
}

function validateUpload(file: Express.Multer.File, kind: "cv" | "cover"): {
  mimeType: string;
  extension: string;
} {
  if (kind === "cv") {
    if (file.mimetype !== "application/pdf" || file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new ApiError(422, "El archivo debe ser un PDF válido");
    }
    return { mimeType: "application/pdf", extension: ".pdf" };
  }

  const signatures = [
    { mimeType: "image/png", extension: ".png", signature: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
    { mimeType: "image/jpeg", extension: ".jpg", signature: Buffer.from([0xff, 0xd8, 0xff]) },
    { mimeType: "image/webp", extension: ".webp", signature: Buffer.from("RIFF", "ascii"), marker: Buffer.from("WEBP", "ascii") },
  ];
  const match = signatures.find(({ signature, marker }) =>
    file.buffer.subarray(0, signature.length).equals(signature) &&
    (!marker || file.buffer.subarray(8, 12).equals(marker)),
  );
  if (!match || file.mimetype !== match.mimeType) {
    throw new ApiError(422, "La portada debe ser una imagen PNG, JPEG o WebP válida");
  }
  return { mimeType: match.mimeType, extension: match.extension };
}

function sanitizeFileName(name: string): string {
  return Array.from(name, (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 || character === '"' || character === "\\"
      ? "_"
      : character;
  }).join("");
}

async function saveUpload(file: Express.Multer.File, kind: "cv" | "cover"): Promise<StoredFile> {
  const { mimeType, extension } = validateUpload(file, kind);
  const id = createId(kind);
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.join(uploadsDirectory, `${id}${extension}`), file.buffer, { flag: "wx" });
  return {
    id: `${id}${extension}`,
    originalName: sanitizeFileName(path.basename(file.originalname)),
    mimeType,
    size: file.size,
  };
}

async function removeUpload(file: StoredFile | null): Promise<void> {
  if (!file) return;
  try {
    await unlink(path.join(uploadsDirectory, path.basename(file.id)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

async function readUpload(file: StoredFile): Promise<Buffer> {
  try {
    return await readFile(path.join(uploadsDirectory, path.basename(file.id)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw notFound("Archivo");
    throw error;
  }
}

function sendUpload(res: Response, file: StoredFile, contents: Buffer, download: boolean): void {
  const name = sanitizeFileName(path.basename(file.originalName));
  const fallbackName = name.replace(/[^\x20-\x7e]/g, "_");
  const encodedName = encodeURIComponent(name).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
  );
  res.setHeader("Content-Length", contents.byteLength);
  res.send(contents);
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
      { method: "GET", path: "/users?q=texto&type=medios", access: "public" },
      { method: "PUT", path: "/users/me", access: "token" },
      { method: "PUT", path: "/users/me/cv", access: "medios token multipart" },
      { method: "DELETE", path: "/users/me/cv", access: "medios token" },
      { method: "GET", path: "/users/:userId/cv", access: "medios token" },
      { method: "GET", path: "/users/:userId", access: "public" },
      { method: "GET", path: "/users/:userId/reviews", access: "public" },
      { method: "GET", path: "/users/me/favorites", access: "token" },
      { method: "GET", path: "/projects", access: "public" },
      { method: "POST", path: "/projects", access: "medios token" },
      { method: "PUT", path: "/projects/:projectId", access: "author token" },
      { method: "DELETE", path: "/projects/:projectId", access: "author token" },
      { method: "GET", path: "/projects/:projectId", access: "public" },
      { method: "PUT", path: "/projects/:projectId/cover", access: "author token multipart" },
      { method: "DELETE", path: "/projects/:projectId/cover", access: "author token" },
      { method: "PUT", path: "/projects/:projectId/team-comment", access: "team member token" },
      { method: "PUT", path: "/projects/:projectId/favorite", access: "token" },
      { method: "DELETE", path: "/projects/:projectId/favorite", access: "token" },
      { method: "PUT", path: "/projects/:projectId/rating", access: "token" },
      { method: "GET", path: "/projects/:projectId/reviews", access: "public" },
      { method: "POST", path: "/projects/:projectId/reviews", access: "token" },
      { method: "PUT", path: "/reviews/:reviewId", access: "author token" },
      { method: "DELETE", path: "/reviews/:reviewId", access: "author token" },
      { method: "PUT", path: "/reviews/:reviewId/like", access: "token" },
      { method: "DELETE", path: "/reviews/:reviewId/like", access: "token" },
      { method: "POST", path: "/reviews/:reviewId/replies", access: "token" },
      { method: "GET", path: "/projects/:projectId/cover", access: "public" },
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
      cv: null,
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

app.put(`${API_PREFIX}/users/me`, requireAuth, async (req, res) => {
  const input = parseOrThrow(profileSchema, req.body);
  const user = await store.update((state) => {
    const current = getUser(state, currentUserId(req));
    current.profile = {
      ...current.profile,
      ...input,
      experiences: input.experiences
        ? input.experiences.map((experience) => ({
          ...experience,
          id: experience.id ?? createId("exp"),
        }))
        : current.profile.experiences,
    };
    current.updatedAt = new Date().toISOString();
    return current;
  });
  res.json({ user: publicUser(user, true) });
});

app.put(
  `${API_PREFIX}/users/me/cv`,
  requireAuth,
  requireMedios,
  upload.single("file"),
  async (req, res) => {
    const userId = currentUserId(req);
    if (!req.file) throw new ApiError(422, "Adjuntá un archivo PDF en el campo file");
    const savedFile = await saveUpload(req.file, "cv");
    let previousFile: StoredFile | null = null;
    let user: UserDocument;
    try {
      user = await store.update((state) => {
        const current = getUser(state, userId);
        assertMedios(current);
        previousFile = current.profile.cv;
        current.profile.cv = savedFile;
        current.updatedAt = new Date().toISOString();
        return current;
      });
    } catch (error) {
      await removeUpload(savedFile);
      throw error;
    }
    await removeUpload(previousFile);
    res.json({ user: publicUser(user, true) });
  },
);

app.delete(`${API_PREFIX}/users/me/cv`, requireAuth, async (req, res) => {
  const oldFile = await store.update((state) => {
    const user = getUser(state, currentUserId(req));
    assertMedios(user);
    const previousFile = user.profile.cv;
    user.profile.cv = null;
    user.updatedAt = new Date().toISOString();
    return previousFile;
  });
  await removeUpload(oldFile);
  res.status(204).end();
});

app.get(`${API_PREFIX}/users/:userId/cv`, requireAuth, async (req, res) => {
  const user = store.read((state) => resolveProfile(state, routeParam(req, "userId")));
  assertMedios(user);
  const file = user.profile.cv;
  if (!file) throw notFound("Currículum");
  sendUpload(res, file, await readUpload(file), req.query.download === "true");
});

app.get(`${API_PREFIX}/users`, (req, res) => {
  const query = String(req.query.q ?? "").trim().toLocaleLowerCase();
  const type = req.query.type === "medios" ? "medios" : null;
  const viewerId = optionalUserId(req);
  const users = store.read((state) =>
    state.users
      .filter((user) =>
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
        cv: viewerId && user.tipo === "medios" && user.profile.cv
          ? {
            originalName: user.profile.cv.originalName,
            mimeType: user.profile.cv.mimeType,
            size: user.profile.cv.size,
            url: `${publicApiUrl}/users/${encodeURIComponent(user.id)}/cv`,
          }
          : null,
      })),
  );
  res.json({ data: users });
});

app.get(`${API_PREFIX}/users/me/favorites`, requireAuth, (req, res) => {
  const userId = currentUserId(req);
  const data = store.read((state) =>
    state.favorites
      .filter((favorite) => favorite.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((favorite) => {
        const project = getProject(state, favorite.projectId);
        return { ...publicProject(project), ...projectStats(state, project.id) };
      }),
  );
  res.json({ data });
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
    user: publicUser(user, isOwner, Boolean(viewerSession)),
    projects: store.read((state) =>
      state.projects
        .filter((project) =>
          project.publicadoPor === user.id ||
          project.equipo.some((member) => member.userId === user.id),
        )
        .map((project) => ({ ...publicProject(project), ...projectStats(state, project.id) })),
    ),
  });
});

app.get(`${API_PREFIX}/users/:userId/reviews`, (req, res) => {
  const viewerId = optionalUserId(req);
  const data = store.read((state) => {
    const user = resolveProfile(state, routeParam(req, "userId"));
    return state.reviews
      .filter((review) => review.userId === user.id)
      .map((review) => ({
        ...reviewView(state, review, viewerId),
        project: publicProject(getProject(state, review.projectId)),
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
        .map((project) => ({ ...publicProject(project), ...projectStats(state, project.id) })),
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
    assertMedios(author);
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
      coverFile: null,
      publicadoPor: authorId,
      equipo: team,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };
    state.projects.push(created);
    return created;
  });
  res.status(201).json({ project: publicProject(project) });
});

app.put(`${API_PREFIX}/projects/:projectId`, requireAuth, async (req, res) => {
  const input = parseOrThrow(projectUpdateSchema, req.body);
  const projectId = routeParam(req, "projectId");
  const updated = await store.update((state) => {
    const project = getProject(state, projectId);
    assertProjectAuthor(project, currentUserId(req));
    const previousTeam = project.equipo;
    if (input.equipo) {
      for (const member of input.equipo) {
        const teammate = getUser(state, member.userId);
        if (teammate.tipo !== "medios") {
          throw new ApiError(422, "El equipo solo puede incluir usuarios de Medios");
        }
      }
    }

    Object.assign(project, input);
    if (input.equipo) {
      const requestedTeam = input.equipo.map((member) => ({
        ...member,
        comment: previousTeam.find((existing) => existing.userId === member.userId)?.comment ?? "",
      }));
      if (!requestedTeam.some((member) => member.userId === project.publicadoPor)) {
        const author = previousTeam.find((member) => member.userId === project.publicadoPor);
        requestedTeam.push(author ?? { userId: project.publicadoPor, roles: ["Autor"], comment: "" });
      }
      project.equipo = requestedTeam;
    }
    project.updatedAt = new Date().toISOString();
    return project;
  });
  res.json({ project: publicProject(updated) });
});

app.delete(`${API_PREFIX}/projects/:projectId`, requireAuth, async (req, res) => {
  const projectId = routeParam(req, "projectId");
  const coverFile = await store.update((state) => {
    const project = getProject(state, projectId);
    assertProjectAuthor(project, currentUserId(req));
    state.projects = state.projects.filter((item) => item.id !== projectId);
    state.favorites = state.favorites.filter((item) => item.projectId !== projectId);
    state.ratings = state.ratings.filter((item) => item.projectId !== projectId);
    const reviewIds = new Set(
      state.reviews.filter((review) => review.projectId === projectId).map((review) => review.id),
    );
    state.reviews = state.reviews.filter((review) => !reviewIds.has(review.id));
    state.reviewLikes = state.reviewLikes.filter((like) => !reviewIds.has(like.reviewId));
    state.reviewReplies = state.reviewReplies.filter((reply) => !reviewIds.has(reply.reviewId));
    return project.coverFile;
  });
  await removeUpload(coverFile);
  res.status(204).end();
});

app.put(
  `${API_PREFIX}/projects/:projectId/cover`,
  requireAuth,
  requireProjectAuthor,
  upload.single("file"),
  async (req, res) => {
    const projectId = routeParam(req, "projectId");
    const project = store.read((state) => getProject(state, projectId));
    assertProjectAuthor(project, currentUserId(req));
    if (!req.file) throw new ApiError(422, "Adjuntá una imagen en el campo file");
    if (req.file.size > 5 * 1024 * 1024) {
      throw new ApiError(413, "La portada no puede superar los 5 MB");
    }
    const savedFile = await saveUpload(req.file, "cover");
    let previousFile: StoredFile | null = null;
    let updated: ProjectDocument;
    try {
      updated = await store.update((state) => {
        const current = getProject(state, projectId);
        assertProjectAuthor(current, currentUserId(req));
        previousFile = current.coverFile;
        current.coverFile = savedFile;
        current.updatedAt = new Date().toISOString();
        return current;
      });
    } catch (error) {
      await removeUpload(savedFile);
      throw error;
    }
    await removeUpload(previousFile);
    res.json({ project: publicProject(updated) });
  },
);

app.delete(`${API_PREFIX}/projects/:projectId/cover`, requireAuth, async (req, res) => {
  const oldFile = await store.update((state) => {
    const project = getProject(state, routeParam(req, "projectId"));
    assertProjectAuthor(project, currentUserId(req));
    const previousFile = project.coverFile;
    project.coverFile = null;
    project.updatedAt = new Date().toISOString();
    return previousFile;
  });
  await removeUpload(oldFile);
  res.status(204).end();
});

app.get(`${API_PREFIX}/projects/:projectId/cover`, async (req, res) => {
  const project = store.read((state) => getProject(state, routeParam(req, "projectId")));
  if (!project.coverFile) throw notFound("Portada");
  sendUpload(res, project.coverFile, await readUpload(project.coverFile), false);
});

app.put(`${API_PREFIX}/projects/:projectId/team-comment`, requireAuth, async (req, res) => {
  const { comment } = parseOrThrow(teamCommentSchema, req.body);
  const project = await store.update((state) => {
    const current = getProject(state, routeParam(req, "projectId"));
    const member = current.equipo.find((item) => item.userId === currentUserId(req));
    if (!member) {
      throw new ApiError(403, "Solo los integrantes del equipo pueden editar su comentario");
    }
    member.comment = comment;
    current.updatedAt = new Date().toISOString();
    return current;
  });
  res.json({ project: publicProject(project) });
});

app.get(`${API_PREFIX}/projects/:projectId`, async (req, res) => {
  const projectId = routeParam(req, "projectId");
  await store.update((state) => {
    const project = getProject(state, projectId);
    project.views = (project.views ?? 0) + 1;
  });
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
    const project = getProject(state, projectId);
    return {
      project: publicProject(project),
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
    if (state.favorites.some((item) => item.userId === userId && item.projectId === projectId)) return;
    const favoriteCount = state.favorites.filter((item) => item.userId === userId).length;
    if (favoriteCount >= 4) {
      throw new ApiError(409, "Ya tenés 4 favoritos; quitá uno antes de agregar otro");
    }
    state.favorites.push({ userId, projectId, createdAt: new Date().toISOString() });
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
  const viewerId = optionalUserId(req);
  const data = store.read((state) => {
    const projectId = routeParam(req, "projectId");
    getProject(state, projectId);
    return state.reviews
      .filter((review) => review.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((review) => reviewView(state, review, viewerId));
  });
  res.json({ data });
});

app.post(`${API_PREFIX}/projects/:projectId/reviews`, requireAuth, async (req, res) => {
  const input = parseOrThrow(reviewSchema, req.body);
  const projectId = routeParam(req, "projectId");
  const userId = currentUserId(req);
  const review = await store.update((state) => {
    const project = getProject(state, projectId);
    if (state.reviews.some((item) => item.projectId === project.id && item.userId === userId)) {
      throw new ApiError(409, "Ya escribiste una reseña para este proyecto");
    }
    const now = new Date().toISOString();
    const created: ReviewDocument = {
      id: createId("rev"),
      projectId: project.id,
      userId,
      value: input.value,
      text: input.text,
      createdAt: now,
      updatedAt: now,
    };
    state.reviews.push(created);
    return created;
  });
  res.status(201).json({
    review: store.read((state) => reviewView(state, review, userId)),
  });
});

app.put(`${API_PREFIX}/reviews/:reviewId`, requireAuth, async (req, res) => {
  const input = parseOrThrow(reviewSchema, req.body);
  const review = await store.update((state) => {
    const current = state.reviews.find((item) => item.id === routeParam(req, "reviewId"));
    if (!current) throw notFound("Reseña");
    if (current.userId !== currentUserId(req)) {
      throw new ApiError(403, "Solo podés editar tus propias reseñas");
    }
    current.value = input.value;
    current.text = input.text;
    current.updatedAt = new Date().toISOString();
    return current;
  });
  res.json({
    review: store.read((state) => reviewView(state, review, currentUserId(req))),
  });
});

app.delete(`${API_PREFIX}/reviews/:reviewId`, requireAuth, async (req, res) => {
  const reviewId = routeParam(req, "reviewId");
  await store.update((state) => {
    const review = state.reviews.find((item) => item.id === reviewId);
    if (!review) throw notFound("Reseña");
    if (review.userId !== currentUserId(req)) {
      throw new ApiError(403, "Solo podés borrar tus propias reseñas");
    }
    state.reviews = state.reviews.filter((item) => item.id !== reviewId);
    state.reviewLikes = state.reviewLikes.filter((item) => item.reviewId !== reviewId);
    state.reviewReplies = state.reviewReplies.filter((item) => item.reviewId !== reviewId);
  });
  res.status(204).end();
});

app.put(`${API_PREFIX}/reviews/:reviewId/like`, requireAuth, async (req, res) => {
  const reviewId = routeParam(req, "reviewId");
  const userId = currentUserId(req);
  const likeCount = await store.update((state) => {
    if (!state.reviews.some((review) => review.id === reviewId)) throw notFound("Reseña");
    if (!state.reviewLikes.some((like) => like.reviewId === reviewId && like.userId === userId)) {
      state.reviewLikes.push({ reviewId, userId, createdAt: new Date().toISOString() });
    }
    return state.reviewLikes.filter((like) => like.reviewId === reviewId).length;
  });
  res.json({ likeCount, isLiked: true });
});

app.delete(`${API_PREFIX}/reviews/:reviewId/like`, requireAuth, async (req, res) => {
  const reviewId = routeParam(req, "reviewId");
  const userId = currentUserId(req);
  const likeCount = await store.update((state) => {
    if (!state.reviews.some((review) => review.id === reviewId)) throw notFound("Reseña");
    state.reviewLikes = state.reviewLikes.filter(
      (like) => like.reviewId !== reviewId || like.userId !== userId,
    );
    return state.reviewLikes.filter((like) => like.reviewId === reviewId).length;
  });
  res.json({ likeCount, isLiked: false });
});

app.post(`${API_PREFIX}/reviews/:reviewId/replies`, requireAuth, async (req, res) => {
  const { text } = parseOrThrow(reviewReplySchema, req.body);
  const userId = currentUserId(req);
  const reply = await store.update((state) => {
    const reviewId = routeParam(req, "reviewId");
    if (!state.reviews.some((review) => review.id === reviewId)) throw notFound("Reseña");
    const now = new Date().toISOString();
    const created: ReviewReplyDocument = {
      id: createId("reply"),
      reviewId,
      userId,
      text,
      createdAt: now,
      updatedAt: now,
    };
    state.reviewReplies.push(created);
    return created;
  });
  res.status(201).json({
    reply: {
      ...reply,
      user: store.read((state) => publicUser(getUser(state, userId))),
    },
  });
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
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({
      error: {
        message: status === 413
          ? "El archivo supera el tamaño máximo permitido"
          : "La carga del archivo no es válida",
      },
    });
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
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({
      error: { message: "El cuerpo de la solicitud supera el tamaño máximo permitido" },
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
