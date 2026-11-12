import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Poster from "../components/Poster";
import { LuDownload, LuMail, LuPencil, LuPhone, LuStar } from "react-icons/lu";
import type { ProyectoPerfil, Experiencia } from "../utils/types";

const favoritos = [
  { id: 1, titulo: "Nocturno", color: "#2a0f1e" },
  { id: 2, titulo: "#07 Mora Lunar", color: "#ff8a6b" },
  { id: 3, titulo: "Ruido blanco", color: "#1c1921" },
  { id: 4, titulo: "Hora pico", color: "#ff2db4" },
];

const proyectos: ProyectoPerfil[] = [
  { id: 1, titulo: "Lo que queda", color: "#ff2db4", tipo: "Cortometraje", anio: 2025, rol: "Dirección - Guion", puntaje: 4.6 },
  { id: 2, titulo: "Pantalla partida", color: "#8b3dff", tipo: "Cross Media", anio: 2025, rol: "Guion - Producción", puntaje: 4.1 },
  { id: 3, titulo: "#06 Plan Z", color: "#ff8a6b", tipo: "Session Bis", anio: 2024, rol: "Asistente de dirección", puntaje: 4.4 },
];

const experiencias: Experiencia[] = [
  { id: 1, anio: 2026, puesto: "Asistente de producción", lugar: "Pasantía en SOSARDA AND CO" },
  { id: 2, anio: 2025, puesto: "Directora y guionista", lugar: "Lo que queda" },
  { id: 3, anio: 2024, puesto: "Asistente de dirección", lugar: "Session Bis #06" },
];

const herramientas = ["Premiere", "Audition"];

export default function Cuenta() {
  const [tab, setTab] = useState("Perfil");

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto flex-1">
        {/* Cabecera */}
        <section className="px-16 py-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-coral flex items-center justify-center font-karla font-bold text-[34px] text-fondo shrink-0">
            MS
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <h1 className="font-slab font-bold text-[26px] text-texto">
                Martina Sosa
              </h1>
              <span className="px-2 py-0.75 rounded-full bg-magenta font-karla font-bold text-[11px] text-fondo">
                Medios
              </span>
            </div>
            <p className="font-karla text-sm text-texto-sec whitespace-pre">
              @msosa  -  4to año - Dirección y guion
            </p>
            <p className="font-karla text-sm leading-normal text-texto-sec max-w-125">
              Directora y guionista. Busco pasantía en producción audiovisual.
            </p>

            <div className="flex gap-2.5 pt-1.5">
              <button className="px-4 py-2.5 rounded border border-borde flex items-center gap-2 font-karla font-bold text-sm text-texto hover:bg-elevado transition-colors cursor-pointer">
                <LuPencil />
                Editar perfil
              </button>
              <button className="px-4 py-2.5 rounded bg-texto flex items-center gap-2 font-karla font-bold text-sm text-fondo hover:opacity-90 transition-opacity cursor-pointer">
                <LuDownload />
                Descargar CV
              </button>
            </div>
          </div>

          <div className="flex-1" />

          {/* Stats */}
          <div className="flex">
            <div className="px-5.5 py-1 flex flex-col items-center gap-0.5">
              <span className="font-slab font-bold text-xl text-texto">3</span>
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Proyectos
              </span>
            </div>
            <div className="px-5.5 py-1 flex flex-col items-center gap-0.5 border-l border-borde">
              <span className="font-slab font-bold text-xl text-texto">23</span>
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Reseñas
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Tabs */}
      <div className="w-full border-b border-borde">
        <div className="w-full max-w-7xl mx-auto px-16 flex gap-7">
          {["Perfil", "Reseñas"].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className="flex flex-col gap-2.5 cursor-pointer"
            >
              <span
                className={`font-karla font-bold text-sm ${
                  tab === item ? "text-texto" : "text-texto-sec"
                }`}
              >
                {item}
              </span>
              <span
                className={`h-0.5 w-full ${tab === item ? "bg-magenta" : ""}`}
              />
            </button>
          ))}
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto">
        {tab === "Perfil" ? (
          <section className="px-16 pt-8 pb-14 flex items-start gap-12">
            {/* Columna izquierda */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Favoritos */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-karla font-bold text-texto-sec">
                  <span className="text-[11px] tracking-[1.1px]">Favoritos</span>
                  <button className="text-[13px] hover:text-texto cursor-pointer">
                    Editar
                  </button>
                </div>
                <div className="h-px w-full bg-borde" />
              </div>

              <div className="flex gap-4.5">
                {favoritos.map((favorito) => (
                  <Poster
                    key={favorito.id}
                    titulo={favorito.titulo}
                    color={favorito.color}
                    className="w-43 h-64.5"
                  />
                ))}
              </div>

              <div className="h-2" />

              {/* Proyectos */}
              <div className="flex flex-col gap-2.5">
                <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-texto-sec">
                  Proyectos
                </span>
                <div className="h-px w-full bg-borde" />
              </div>

              <div className="flex flex-col">
                {proyectos.map((proyecto, index) => (
                  <div
                    key={proyecto.id}
                    className={`py-3 flex items-center gap-4 ${
                      index < proyectos.length - 1 ? "border-b border-borde" : ""
                    }`}
                  >
                    <Poster
                      titulo={proyecto.titulo}
                      color={proyecto.color}
                      tituloArriba
                      className="w-14 h-21 p-1.5!"
                      textoClassName="text-[9px]"
                    />
                    <div className="flex flex-col gap-1.25">
                      <span className="font-slab font-semibold text-base text-texto">
                        {proyecto.titulo}
                      </span>
                      <span className="font-karla text-[13px] text-apagado">
                        {proyecto.tipo} - {proyecto.anio}
                      </span>
                      <span className="font-karla text-[13px]">
                        <span className="text-apagado">Rol:</span>{" "}
                        <span className="font-bold text-texto">{proyecto.rol}</span>
                      </span>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.25 font-karla font-bold text-[13px] text-texto-sec">
                      <LuStar className="w-3.25 h-3.25 text-coral" />
                      {proyecto.puntaje}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha: CV */}
            <aside className="w-90 shrink-0 p-5 rounded-md bg-superficie border border-borde flex flex-col gap-3.5">
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-texto-sec">
                Currículum
              </span>

              <div className="p-3 rounded bg-elevado flex items-center gap-3">
                <div className="w-8.5 h-10.5 rounded-[3px] bg-coral flex items-center justify-center font-karla font-bold text-[10px] text-fondo">
                  PDF
                </div>
                <div className="flex flex-col gap-0.75">
                  <span className="font-karla font-bold text-sm text-texto">
                    CV_Martina_Vega.pdf
                  </span>
                  <span className="font-karla text-xs text-apagado">
                    1 página - 120 KB
                  </span>
                </div>
              </div>

              <button className="w-full px-4 py-2.5 rounded border border-borde font-karla font-bold text-sm text-texto hover:bg-elevado transition-colors cursor-pointer">
                Reemplazar
              </button>

              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Experiencia
              </span>
              {experiencias.map((experiencia) => (
                <div key={experiencia.id} className="flex gap-3.5 font-karla">
                  <span className="font-bold text-[13px] text-coral">
                    {experiencia.anio}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-texto">
                      {experiencia.puesto}
                    </span>
                    <span className="text-[13px] text-texto-sec">
                      {experiencia.lugar}
                    </span>
                  </div>
                </div>
              ))}

              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Herramientas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {herramientas.map((herramienta) => (
                  <span
                    key={herramienta}
                    className="px-2.5 py-1.25 rounded-full bg-elevado font-karla font-bold text-xs text-texto-sec"
                  >
                    {herramienta}
                  </span>
                ))}
              </div>

              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Contacto
              </span>
              <div className="flex items-center gap-2.5 font-karla text-sm text-texto">
                <LuMail className="w-3.75 h-3.75 text-texto-sec" />
                martina.sosa@ort.edu.ar
              </div>
              <div className="flex items-center gap-2.5 font-karla text-sm text-texto">
                <LuPhone className="w-3.75 h-3.75 text-texto-sec" />
                +54 11 3028 5858
              </div>
            </aside>
          </section>
        ) : (
          <section className="px-16 pt-8 pb-14">
            <p className="font-karla text-sm text-texto-sec">
              Acá van a aparecer tus reseñas.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
