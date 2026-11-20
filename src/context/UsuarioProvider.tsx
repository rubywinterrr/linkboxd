import { useEffect, useState, type ReactNode } from "react";
import { UsuarioContext } from "./UsuarioContext";
import type { Usuario } from "../utils/types";
import { apiRequest, getToken, toUsuario, type ApiUser } from "../utils/api";

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiRequest<{ user: ApiUser }>("/auth/me")
      .then(({ user }) => setUsuario(toUsuario(user)))
      .catch((error: unknown) => {
        console.error("No se pudo restaurar la sesión:", error);
        localStorage.removeItem("token");
        setUsuario(null);
      })
      .finally(() => setCargando(false));
  }, []);

  const guardarSesion = (nuevoUsuario: Usuario, token: string) => {
    localStorage.setItem("token", token);
    setUsuario(nuevoUsuario);
  };
  const esMedios = usuario?.tipo === "medios";

  const cerrarSesion = () => {
    const token = getToken();
    if (token) {
      void apiRequest<void>("/auth/logout", { method: "POST" }).catch((error: unknown) => {
        console.error("No se pudo cerrar la sesión en el servidor:", error);
      });
    }
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        cargando,
        esMedios,
        registrarse: guardarSesion,
        iniciarSesion: guardarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}
