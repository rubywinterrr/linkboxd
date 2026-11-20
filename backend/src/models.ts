export type UserType = "medios" | "outsider";

export interface Experience {
  id: string;
  year: number;
  position: string;
  place: string;
}

export interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UserProfile {
  bio: string;
  year: number | null;
  specialty: string;
  phone: string | null;
  tools: string[];
  experiences: Experience[];
  cv: StoredFile | null;
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
  coverFile: StoredFile | null;
  publicadoPor: string;
  equipo: ProjectMember[];
  views: number;
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

export interface ReviewLikeDocument {
  reviewId: string;
  userId: string;
  createdAt: string;
}

export interface ReviewReplyDocument {
  id: string;
  reviewId: string;
  userId: string;
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
  reviewLikes: ReviewLikeDocument[];
  reviewReplies: ReviewReplyDocument[];
  sessions: SessionDocument[];
}

export type PublicUser = Omit<UserDocument, "passwordHash" | "email" | "profile"> & {
  email?: string;
  profile: Omit<UserProfile, "cv"> & {
    cv: (Omit<StoredFile, "id"> & { url: string }) | null;
  };
};
