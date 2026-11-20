const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1")
  .replace(/\/+$/, "");

export interface ApiUser {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  tipo: "medios" | "outsider";
  email?: string;
  profile?: {
    bio: string;
    year: number | null;
    specialty: string;
    phone: string | null;
    tools: string[];
    experiences: { id: string; year: number; position: string; place: string }[];
    cv: { originalName: string; mimeType: string; size: number; url: string } | null;
  };
}

export interface ApiProject {
  id: string;
  titulo: string;
  tipo: string;
  anio: number;
  genero: string;
  duracionMinutos: number | null;
  descripcion: string;
  url: string;
  imagen: string | null;
  publicadoPor: string;
  equipo: {
    userId: string;
    roles: string[];
    comment: string;
  }[];
  ratingAverage: number;
  ratingCount: number;
  ratingHistogram: number[];
  reviewCount: number;
  favoriteCount: number;
  viewCount: number;
  isFavorite?: boolean;
  myRating?: number | null;
}

export interface ApiReview {
  id: string;
  projectId: string;
  userId: string;
  value: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: ApiUser;
  likeCount: number;
  isLiked: boolean;
  replies: {
    id: string;
    text: string;
    user: ApiUser;
    createdAt: string;
  }[];
}

interface ApiErrorResponse {
  error?: {
    message?: string;
    fields?: Record<string, string>;
  };
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  responseType: "json" | "blob" = "json",
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const error = await response.json().catch(() => null) as ApiErrorResponse | null;
    const details = error?.error?.fields
      ? Object.values(error.error.fields).join(" ")
      : "";
    throw new Error(
      [error?.error?.message ?? `Error HTTP ${response.status}`, details]
        .filter(Boolean)
        .join(": "),
    );
  }
  return (responseType === "blob" ? response.blob() : response.json()) as Promise<T>;
}

export function toUsuario(user: ApiUser) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    nombreUsuario: user.nombreUsuario,
    mail: user.email ?? "",
    tipo: user.tipo,
  };
}
