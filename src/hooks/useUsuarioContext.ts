import { useContext } from "react";
import { UsuarioContext } from "../context/UsuarioContext";

export default function useUsuarioContext() {
  const context = useContext(UsuarioContext);

  if (!context) {
    throw new Error("useUsuarioContext tiene que usarse dentro de un UsuarioProvider");
  }

  return context;
}
