import { Link } from "react-router-dom";
import type { Fila } from "../utils/types";
import Poster from "./Poster";
import { IconoEstrella, IconoFlecha } from "./Iconos";

export default function FilaProyectos({ nombre, cuadrado, proyectos }: Fila) {
  return (
    <section className="w-full px-16 py-6 flex flex-col gap-3.5">
      {/* Encabezado de la fila */}
      <div className="flex items-center justify-between">
        <h2 className="font-slab font-semibold text-xl text-texto">{nombre}</h2>
        <Link
          to="/explorar"
          className="flex items-center gap-1.5 font-karla font-bold text-[13px] text-texto-sec hover:text-texto transition-colors"
        >
          Ver todo
          <IconoFlecha />
        </Link>
      </div>

      <div className="h-px w-full bg-borde" />

      {/* Pósters */}
      <div className="flex justify-between gap-4 overflow-x-auto">
        {proyectos.map((proyecto) => (
          <Link
            key={proyecto.id}
            to="/proyecto"
            className="flex flex-col gap-2 shrink-0 hover:-translate-y-1 transition-transform"
          >
            <Poster
              titulo={proyecto.titulo}
              color={proyecto.color}
              tituloArriba={proyecto.tituloArriba}
              className={cuadrado ? "w-37 h-37" : "w-37 h-55.5"}
            />
            <div className="flex items-center gap-1 font-karla text-xs">
              <IconoEstrella className="w-2.75 h-2.75 text-coral" />
              <span className="font-bold text-texto-sec">{proyecto.puntaje}</span>
              <span className="text-apagado">- {proyecto.anio}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
