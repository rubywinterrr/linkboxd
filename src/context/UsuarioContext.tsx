import { createContext } from "react";
import type { Usuario } from "../utils/types";

export interface UsuarioContextType {
  usuario: Usuario | null;
  esMedios: boolean;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
}

export const UsuarioContext = createContext<UsuarioContextType | null>(null);