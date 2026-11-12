import { useState } from "react";
import Navbar from "../components/Navbar";
import FilaProyectos from "../components/FilaProyectos";
import Footer from "../components/Footer";
import type { Fila } from "../utils/types";

const filtros = [
  "Todo",
  "Cortometrajes",
  "Podcasts y radio",
  "Session Bis",
  "Cross Media",
  "Animación",
  "Documental",
];

const filas: Fila[] = [
  {
    id: 1,
    nombre: "Cortometrajes",
    proyectos: [
      { id: 1, titulo: "Viste el menu?", color: "#ff2db4", anio: 2025, puntaje: 4.6, tituloArriba: true },
      { id: 2, titulo: "Hamburguesa", color: "#1c1921", anio: 2024, puntaje: 4.1 },
      { id: 3, titulo: "Qué es?", color: "#ff8a6b", anio: 2025, puntaje: 3.9 },
      { id: 4, titulo: "Un menu", color: "#f6f2ee", anio: 2024, puntaje: 4.4 },
      { id: 5, titulo: "Hamburguesa", color: "#2a0f1e", anio: 2025, puntaje: 4.8 },
      { id: 6, titulo: "De verdad!", color: "#ff5c9a", anio: 2024, puntaje: 3.7, tituloArriba: true },
      { id: 7, titulo: "Muy gracioso", color: "#131116", anio: 2025, puntaje: 4.2 },
    ],
  },
  {
    id: 2,
    nombre: "Podcasts y radio",
    cuadrado: true,
    proyectos: [
      { id: 8, titulo: "SZD50", color: "#f6f2ee", anio: 2024, puntaje: 4.1 },
      { id: 9, titulo: "ASK13", color: "#2a0f1e", anio: 2025, puntaje: 3.9 },
      { id: 10, titulo: "El Rojo", color: "#ff5c9a", anio: 2024, puntaje: 4.4 },
      { id: 11, titulo: "La Nancy", color: "#131116", anio: 2025, puntaje: 4.8 },
      { id: 12, titulo: "No se me ocurren", color: "#8b3dff", anio: 2024, puntaje: 3.7, tituloArriba: true },
      { id: 13, titulo: "Más planeadores", color: "#ff2db4", anio: 2025, puntaje: 4.2 },
      { id: 14, titulo: "El Club", color: "#1c1921", anio: 2024, puntaje: 4.6 },
    ],
  },
  {
    id: 3,
    nombre: "Session Bis",
    proyectos: [
      { id: 15, titulo: "#07 Mora Lunar", color: "#131116", anio: 2025, puntaje: 3.9 },
      { id: 16, titulo: "#06 Plan Z", color: "#8b3dff", anio: 2024, puntaje: 4.4 },
      { id: 17, titulo: "#05 Las Tías", color: "#ff2db4", anio: 2025, puntaje: 4.8 },
      { id: 18, titulo: "#04 Faro", color: "#1c1921", anio: 2024, puntaje: 3.7, tituloArriba: true },
      { id: 19, titulo: "#03 Neón Club", color: "#ff8a6b", anio: 2025, puntaje: 4.2 },
      { id: 20, titulo: "#02 Calma", color: "#f6f2ee", anio: 2024, puntaje: 4.6 },
      { id: 21, titulo: "#01 Raíz", color: "#2a0f1e", anio: 2025, puntaje: 4.1 },
    ],
  },
  {
    id: 4,
    nombre: "Cross Media",
    proyectos: [
      { id: 22, titulo: "Pantalla partida", color: "#1c1921", anio: 2024, puntaje: 4.4 },
      { id: 23, titulo: "Nadie escucha", color: "#ff8a6b", anio: 2025, puntaje: 4.8 },
      { id: 24, titulo: "Mapa sonoro", color: "#f6f2ee", anio: 2024, puntaje: 3.7, tituloArriba: true },
      { id: 25, titulo: "La casa de enfrente", color: "#2a0f1e", anio: 2025, puntaje: 4.2 },
      { id: 26, titulo: "Doble vida", color: "#ff5c9a", anio: 2024, puntaje: 4.6 },
      { id: 27, titulo: "Feed", color: "#131116", anio: 2025, puntaje: 4.1 },
      { id: 28, titulo: "Hilos", color: "#8b3dff", anio: 2024, puntaje: 3.9 },
    ],
  },
  {
    id: 5,
    nombre: "Animación",
    proyectos: [
      { id: 29, titulo: "Nocturno", color: "#2a0f1e", anio: 2025, puntaje: 4.8 },
      { id: 30, titulo: "Pulpo", color: "#ff5c9a", anio: 2024, puntaje: 3.7, tituloArriba: true },
      { id: 31, titulo: "Tiza", color: "#131116", anio: 2025, puntaje: 4.2 },
      { id: 32, titulo: "Papel picado", color: "#8b3dff", anio: 2024, puntaje: 4.6 },
      { id: 33, titulo: "Origami", color: "#ff2db4", anio: 2025, puntaje: 4.1 },
      { id: 34, titulo: "Loop", color: "#1c1921", anio: 2024, puntaje: 3.9 },
      { id: 35, titulo: "Hormigas", color: "#ff8a6b", anio: 2025, puntaje: 4.4, tituloArriba: true },
    ],
  },
];

export default function Inicio() {
  const [filtro, setFiltro] = useState("Todo");

  // Si el filtro es "Todo" se muestran todas las filas, si no solo la elegida
  const filasVisibles =
    filtro === "Todo" ? filas : filas.filter((fila) => fila.nombre === filtro);

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto flex-1">
        {/* Intro */}
        <section className="px-16 pt-9 pb-3 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-slab font-bold text-[26px] text-texto">
              Hola, Martina
            </h1>
            <p className="font-karla text-[15px] text-texto-sec">
              Esto es lo nuevo de la especialidad Medios esta semana.
            </p>
          </div>

          {/* Filtros por tipo */}
          <div className="flex flex-wrap gap-2">
            {filtros.map((item) => (
              <button
                key={item}
                onClick={() => setFiltro(item)}
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

        {/* Filas por tipo de contenido */}
        {filasVisibles.map((fila) => (
          <FilaProyectos
            key={fila.id}
            id={fila.id}
            nombre={fila.nombre}
            cuadrado={fila.cuadrado}
            proyectos={fila.proyectos}
          />
        ))}

        {filasVisibles.length === 0 && (
          <p className="px-16 py-12 font-karla text-texto-sec">
            Todavía no hay proyectos de {filtro}.
          </p>
        )}
      </main>

      <Footer conLinks />
    </div>
  );
}
