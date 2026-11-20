import { createContext } from "react";
import type { Usuario } from "../utils/types";

export interface UsuarioContextType {
  usuario: Usuario | null;
  cargando: boolean;
  esMedios: boolean;
  registrarse: (usuario: Usuario, token: string) => void;
  iniciarSesion: (usuario: Usuario, token: string) => void;
  cerrarSesion: () => void;
}

export const UsuarioContext = createContext<UsuarioContextType | null>(null);