import { z } from "zod";

const trimmedText = (max: number) => z.string().trim().min(1).max(max);

export const registerSchema = z.object({
  nombre: trimmedText(80),
  apellido: trimmedText(80),
  nombreUsuario: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.email().max(254),
  password: z.string().min(8).max(128),
  telefono: z.string().trim().max(40).optional().default(""),
});

export const loginSchema = z.object({
  identificador: z.string().trim().min(1).max(254).optional(),
  nombreUser: z.string().trim().min(1).max(254).optional(),
  email: z.email().max(254).optional(),
  password: z.string().min(1).max(128),
}).refine(
  (value) => Boolean(value.identificador || value.nombreUser || value.email),
  { message: "Ingresá el nombre de usuario o el correo", path: ["identificador"] },
);

const projectMemberSchema = z.object({
  userId: trimmedText(80),
  roles: z.array(trimmedText(80)).min(1).max(12),
  comment: z.string().trim().max(1000).optional().default(""),
});

export const projectSchema = z.object({
  titulo: trimmedText(160),
  tipo: z.enum([
    "Cortometraje",
    "Podcast y radio",
    "Session Bis",
    "Cross Media",
    "Animación",
    "Documental",
    "Otro",
  ]),
  anio: z.number().int().min(1900).max(2200),
  genero: z.string().trim().max(80).optional().default(""),
  duracionMinutos: z.number().int().min(1).max(1000).nullable().optional().default(null),
  descripcion: trimmedText(5000),
  url: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  imagen: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)).nullable().optional().default(null),
  equipo: z.array(projectMemberSchema).max(100).optional().default([])
    .refine((members) => new Set(members.map((member) => member.userId)).size === members.length, {
      message: "No repitas integrantes en el equipo",
    }),
});

export const ratingSchema = z.object({
  value: z.number().int().min(1).max(5),
});

export const reviewSchema = z.object({
  value: z.number().int().min(1).max(5),
  text: trimmedText(3000),
});

export function parseOrThrow<T>(
  schema: z.ZodType<T>,
  input: unknown,
): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}
