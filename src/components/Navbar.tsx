import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HamburguesaIcon from "./HamburguesaIcon";
import MenuLateral from "./MenuLateral";
import { LuSearch } from "react-icons/lu";
import flecha from "./flecha.png";
import useUsuarioContext from "../hooks/useUsuarioContext";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const { usuario, esMedios } = useUsuarioContext();

  const handleBack = () => {
    navigate(-1);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full bg-fondo border-b border-borde flex items-center justify-between px-12">
        {/* Izquierda: logo */}
        <div className="w-75 flex items-center">
          <button className="absolute left-4 flex items-center justify-center" onClick={handleBack}>
            <img src={flecha} alt="arrow" className="w-6 h-6 invert" />
          </button>
          <Link to="/" className="flex items-center gap-1">
            <span className="font-slab font-bold text-xl text-texto">
              LinkBox<span className="text-magenta">d</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-magenta to-coral" />
          </Link>
        </div>

        {/* Centro: links */}
        <div className="flex items-center">
          <Link to="/inicio" className="font-karla font-bold text-sm text-texto">
            Explorar
          </Link>
        </div>

        {/* Derecha: acciones */}
        <div className="w-75 flex items-center justify-end gap-4.5">
          {buscarAbierto && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/inicio?q=${encodeURIComponent(busqueda.trim())}`);
                setBuscarAbierto(false);
              }}
            >
              <input
                autoFocus
                aria-label="Buscar proyectos"
                placeholder="Buscar proyectos"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className="w-40 bg-transparent border-b border-borde px-2 py-1 text-sm text-texto outline-none"
              />
            </form>
          )}
          <button
            aria-label={buscarAbierto ? "Cerrar búsqueda" : "Buscar proyectos"}
            onClick={() => setBuscarAbierto((open) => !open)}
            className="text-texto cursor-pointer"
          >
            <LuSearch className="w-4.5 h-4.5" />
          </button>

          {esMedios && (
            <Link
              to="/publicar"
              className="px-3.5 py-2 rounded border border-borde font-karla font-bold text-[13px] text-texto hover:bg-elevado transition-colors"
            >
              Publicar
            </Link>
          )}

          {usuario ? (
            <Link
              to="/cuenta"
              className="w-8 h-8 rounded-full bg-coral flex items-center justify-center font-karla font-bold text-[11px] text-fondo"
            >
              {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
            </Link>
          ) : (
            <Link
              to="/iniciosesion"
              className="px-3.5 py-2 rounded border border-borde font-karla font-bold text-[13px] text-texto hover:bg-elevado transition-colors"
            >
              Ingresar
            </Link>
          )}

          {/* Easter egg: el menú es una hamburguesa de verdad */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`w-10 h-10 -m-1.5 flex items-center justify-center rounded-lg border cursor-pointer transition-colors ${menuAbierto ? "bg-fondo border-borde" : "border-transparent"
              }`}
          >
            <HamburguesaIcon abierta={menuAbierto} />
          </button>
        </div>
      </nav>

      {menuAbierto && <MenuLateral cerrarMenu={() => setMenuAbierto(false)} />}
    </>
  );
}
