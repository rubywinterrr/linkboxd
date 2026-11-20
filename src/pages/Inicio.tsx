import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import FilaProyectos from "../components/FilaProyectos";
import Navbar from "../components/Navbar";
import useUsuarioContext from "../hooks/useUsuarioContext";
import { apiRequest, type ApiProject } from "../utils/api";
import type { Fila } from "../utils/types";

const filtros = [
  "Todo",
  "Cortometraje",
  "Podcast y radio",
  "Session Bis",
  "Cross Media",
  "Animación",
  "Documental",
  "Otro",
];
const colores = ["#ff2db4", "#1c1921", "#ff8a6b", "#f6f2ee", "#2a0f1e", "#ff5c9a", "#131116"];

function colorFor(project: ApiProject): string {
  const index = project.titulo.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return colores[index % colores.length] ?? "#ff2db4";
}

export default function Inicio() {
  const [proyectos, setProyectos] = useState<ApiProject[]>([]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { usuario } = useUsuarioContext();
  const filtro = searchParams.get("type") ?? "Todo";
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const search = query ? `&q=${encodeURIComponent(query)}` : "";
    apiRequest<{ data: ApiProject[] }>(`/projects?sort=recent&limit=50${search}`)
      .then(({ data }) => {
        setProyectos(data);
        setError(null);
        setLoadedQuery(query);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "No se pudieron cargar los proyectos");
        setLoadedQuery(query);
      });
  }, [query]);

  const filas = useMemo<Fila[]>(() => {
    const tipos = filtro === "Todo" ? filtros.slice(1) : [filtro];
    return tipos.map((tipo) => ({
      id: tipo,
      nombre: tipo,
      cuadrado: tipo === "Podcast y radio",
      proyectos: proyectos
        .filter((project) => project.tipo === tipo)
        .map((project) => ({
          id: project.id,
          titulo: project.titulo,
          color: colorFor(project),
          anio: project.anio,
          puntaje: project.ratingAverage,
        })),
    })).filter((row) => row.proyectos.length > 0);
  }, [filtro, proyectos]);
  const cargando = loadedQuery !== query;

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto flex-1">
        <section className="px-16 pt-9 pb-3 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-slab font-bold text-[26px] text-texto">
              Hola{usuario ? `, ${usuario.nombre}` : ""}
            </h1>
            <p className="font-karla text-[15px] text-texto-sec">
              {query ? `Resultados para “${query}”.` : "Explorá los proyectos de la comunidad."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtros.map((item) => (
              <button
                key={item}
                onClick={() => setSearchParams(item === "Todo" ? {} : { type: item })}
                className={`px-3.5 py-1.75 rounded-full font-karla font-bold text-[13px] border cursor-pointer transition-colors ${
                  filtro === item
                    ? "bg-texto text-fondo border-texto"
                    : "border-borde text-texto-sec hover:text-texto"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {error && <p role="alert" className="px-16 py-6 text-red-400">{error}</p>}
        {cargando && <p className="px-16 py-6 text-texto-sec">Cargando proyectos...</p>}
        {!cargando && !error && filas.map((fila) => (
          <FilaProyectos
            key={fila.id}
            id={typeof fila.id === "number" ? fila.id : 0}
            nombre={fila.nombre}
            cuadrado={fila.cuadrado}
            proyectos={fila.proyectos}
          />
        ))}
        {!cargando && !error && filas.length === 0 && (
          <p className="px-16 py-12 font-karla text-texto-sec">
            Todavía no hay proyectos{filtro !== "Todo" ? ` de ${filtro}` : ""}.
          </p>
        )}
      </main>
      <Footer conLinks />
    </div>
  );
}
