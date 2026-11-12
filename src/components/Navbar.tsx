import { useState } from "react";
import { Link } from "react-router-dom";
import HamburguesaIcon from "./HamburguesaIcon";
import MenuLateral from "./MenuLateral";
import { LuSearch } from "react-icons/lu";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full bg-fondo border-b border-borde flex items-center justify-between px-12">
        {/* Izquierda: logo */}
        <div className="w-75 flex items-center">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-slab font-bold text-xl text-texto">
              LinkBox<span className="text-magenta">d</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-magenta to-coral" />
          </Link>
        </div>

        {/* Centro: links */}
        <div className="flex items-center">
          <Link to="/" className="font-karla font-bold text-sm text-texto">
            Explorar
          </Link>
        </div>

        {/* Derecha: acciones */}
        <div className="w-75 flex items-center justify-end gap-4.5">
          <button className="text-texto cursor-pointer">
            <LuSearch className="w-4.5 h-4.5" />
          </button>

          <Link
            to="/publicar"
            className="px-3.5 py-2 rounded border border-borde font-karla font-bold text-[13px] text-texto hover:bg-elevado transition-colors"
          >
            Publicar
          </Link>

          <Link
            to="/cuenta"
            className="w-8 h-8 rounded-full bg-coral flex items-center justify-center font-karla font-bold text-[11px] text-fondo"
          >
            MS
          </Link>

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
