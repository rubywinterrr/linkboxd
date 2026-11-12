import { useState, type ReactNode } from "react";
import { UsuarioContext } from "./UsuarioContext";
import type { Usuario } from "../utils/types";

export function UsuarioProvider({ children }: { children: ReactNode }) {
  // Hardcodeado hasta que esté el inicio de sesión. Después va null.
  const [usuario, setUsuario] = useState<Usuario | null>({
    nombre: "Martina",
    apellido: "Sosa",
    nombreUsuario: "msosa",
    mail: "martina.sosa@ort.edu.ar",
    tipo: "medios", // cambiar a "outsider" para probar el otro rol 
  });

  const esMedios = usuario?.tipo === "medios";

  const iniciarSesion = (nuevoUsuario: Usuario) => setUsuario(nuevoUsuario);

  const cerrarSesion = () => setUsuario(null);

  return (
    <UsuarioContext.Provider
      value={{ usuario, esMedios, iniciarSesion, cerrarSesion }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}