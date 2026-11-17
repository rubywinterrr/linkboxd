export type UserType = "medios" | "outsider";

export interface Experience {
  id: string;
  year: number;
  position: string;
  place: string;
}

export interface UserProfile {
  bio: string;
  year: number | null;
  specialty: string;
  phone: string | null;
  tools: string[];
  experiences: Experience[];
}

export interface UserDocument {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
  passwordHash: string;
  tipo: UserType;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  roles: string[];
  comment: string;
}

export interface ProjectDocument {
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
  equipo: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteDocument {
  userId: string;
  projectId: string;
  createdAt: string;
}

export interface RatingDocument {
  userId: string;
  projectId: string;
  value: number;
  updatedAt: string;
}

export interface ReviewDocument {
  id: string;
  projectId: string;
  userId: string;
  value: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDocument {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}

export interface DatabaseState {
  users: UserDocument[];
  projects: ProjectDocument[];
  favorites: FavoriteDocument[];
  ratings: RatingDocument[];
  reviews: ReviewDocument[];
  sessions: SessionDocument[];
}

export type PublicUser = Omit<UserDocument, "passwordHash" | "email"> & {
  email?: string;
};
