import { Link, useLocation } from "react-router-dom";
import { LuHeart, LuLogOut, LuPlus, LuSettings, LuStar, LuUser } from "react-icons/lu";

interface MenuLateralProps {
  cerrarMenu: () => void;
}

export default function MenuLateral({ cerrarMenu }: MenuLateralProps) {
  const location = useLocation();

  const linksPrincipales = [
    { id: 1, label: "Inicio", path: "/" },
    { id: 2, label: "Explorar", path: "/explorar" },
    { id: 3, label: "Alumnos", path: "/alumnos" },
    { id: 4, label: "ORT Medios", path: "/ort-medios" },
  ];

  const linksSecundarios = [
    { id: 1, label: "Mis favoritos", path: "/cuenta", icono: <LuHeart className="w-4.5 h-4.5"  />, extra: "4/4" },
    { id: 2, label: "Mis reseñas", path: "/cuenta", icono: <LuStar className="w-4.5 h-4.5" /> },
    { id: 3, label: "Publicar proyecto", path: "/publicar", icono: <LuPlus className="w-4.5 h-4.5" /> },
    { id: 4, label: "Mi perfil y CV", path: "/cuenta", icono: <LuUser className="w-4.5 h-4.5" /> },
    { id: 5, label: "Configuración", path: "/configuracion", icono: <LuSettings className="w-4.5 h-4.5"/> },
  ];

  return (
    <div className="fixed inset-0 top-16 z-40">
      {/* Fondo oscuro: si tocás afuera se cierra */}
      <div
        onClick={cerrarMenu}
        className="absolute inset-0 bg-fondo/60 backdrop-blur-sm"
      />

      {/* Panel lateral */}
      <aside className="absolute top-0 right-0 h-full w-95 bg-superficie border-l border-borde p-8 flex flex-col gap-2 overflow-y-auto">
        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center font-karla font-bold text-[13px] text-fondo">
            MS
          </div>
          <div className="flex flex-col gap-0.5 font-karla text-[13px]">
            <span className="font-bold text-texto">Martina Sosa</span>
            <span className="text-apagado">Alumna de Medios</span>
          </div>
        </div>

        <div className="h-px w-full bg-borde" />

        {/* Links principales */}
        <div className="flex flex-col gap-2">
          {linksPrincipales.map((link) => {
            const activo = location.pathname === link.path;
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={cerrarMenu}
                className={`px-3 py-2.5 rounded-lg font-slab font-bold text-[22px] hover:bg-elevado transition-colors ${
                  activo ? "text-magenta" : "text-texto"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="h-px w-full bg-borde" />

        {/* Links secundarios */}
        <div className="flex flex-col gap-2">
          {linksSecundarios.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              onClick={cerrarMenu}
              className="px-3 py-2.5 rounded-lg flex items-center justify-between text-texto-sec hover:bg-elevado transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {link.icono}
                <span className="font-karla text-[15px]">{link.label}</span>
              </span>
              {link.extra && (
                <span className="font-karla font-bold text-[13px] text-apagado">
                  {link.extra}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Espacio para empujar "Cerrar sesión" abajo */}
        <div className="flex-1" />

        <Link
          to="/inicio-sesion"
          onClick={cerrarMenu}
          className="px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-apagado hover:bg-elevado transition-colors"
        >
          <LuLogOut />
          <span className="font-karla font-bold text-[15px]">Cerrar sesión</span>
        </Link>
      </aside>
    </div>
  );
}
