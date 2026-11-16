import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuEye,
  LuHeart,
  LuMessageSquare,
  LuShare,
  LuPlay,
} from "react-icons/lu";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Poster from "../components/Poster";
import Avatar from "../components/Avatar";
import Estrellas from "../components/Estrellas";
import type { Integrante, Resena } from "../utils/types";

const etiquetas = ["Cortometraje", "Drama", "14 min", "4to Medios D"];

const equipo: Integrante[] = [
  { id: 1, rol: "Dirección", nombres: ["Martina Sosa"] },
  { id: 2, rol: "Guion", nombres: ["Martina Sosa", "Bruno Sosa"] },
  { id: 3, rol: "Fotografía", nombres: ["Joaquín Sosa"] },
  { id: 4, rol: "Sonido", nombres: ["Tomás Sosa"] },
  { id: 5, rol: "Montaje", nombres: ["Bruno Sosa"] },
  { id: 6, rol: "Arte", nombres: ["Sosa Sosa"] },
];

const detalles = [
  { id: 1, label: "Tipo", valor: "Cortometraje" },
  { id: 2, label: "Género", valor: "Drama" },
  { id: 3, label: "Duración", valor: "14 min" },
  { id: 4, label: "Curso", valor: "4to Medios D" },
  { id: 5, label: "Año", valor: "2025" },
];

const comentariosEquipo = [
  {
    id: 1,
    nombre: "Martina Sosa",
    iniciales: "MS",
    color: "#ff8a6b",
    rol: "Dirección",
    texto:
      "Filmamos todo en una noche en un mansion real. Fue mi primera vez dirigiendo actores y armando un plan de rodaje completo.",
  },
  {
    id: 2,
    nombre: "Tomás Sosa",
    iniciales: "TR",
    color: "#ff5c9a",
    rol: "Sonido",
    texto:
      "Grabar el ruido ambiente del jardín fue clave; me parece una escena clave del corto.",
  },
];

const resenasIniciales: Resena[] = [
  {
    id: 1,
    nombre: "Lucía Sosarda",
    iniciales: "LP",
    color: "#ff2db4",
    puntaje: 5,
    fecha: "hace 2 días",
    texto: "Me voló la cabezaaaaaa.",
    meGusta: 24,
    comentarios: [
      { id: 1, nombre: "Martina Sosa", iniciales: "MS", color: "#ff8a6b", texto: "Gracias Lu!!" },
      { id: 2, nombre: "Nico Sosardo", iniciales: "NF", color: "#1c1921", texto: "Coincidoooooo" },
    ],
  },
  {
    id: 2,
    nombre: "Valen Sosardo",
    iniciales: "VR",
    color: "#f6f2ee",
    puntaje: 4,
    fecha: "hace 1 semana",
    texto: "Muy linda la dirección de arte, genios los Sosa",
    meGusta: 11,
    comentarios: [],
  },
  {
    id: 3,
    nombre: "Sosardo Junior",
    iniciales: "NF",
    color: "#1c1921",
    puntaje: 4,
    fecha: "hace 2 semanas",
    texto: "Pero que increible corto (emoji de aplauso no se no la encontre)",
    meGusta: 8,
    comentarios: [],
  },
];

// Altura de cada barrita del gráfico de puntajes (de 0.5 a 5 estrellas)
const barras = [3, 3, 5, 6, 10, 14, 26, 44, 52, 36];

export default function Proyecto() {
  const [enFavoritos, setEnFavoritos] = useState(true);
  const [miPuntaje, setMiPuntaje] = useState(4);
  const [tab, setTab] = useState("Equipo");
  const [orden, setOrden] = useState("Populares");
  const [resenas, setResenas] = useState<Resena[]>(resenasIniciales);
  const [textoResena, setTextoResena] = useState("");
  const [puntajeResena, setPuntajeResena] = useState(0);

  const publicarResena = () => {
    if (textoResena.trim() === "" || puntajeResena === 0) return;

    const nueva: Resena = {
      id: resenas.length + 1,
      nombre: "Martina Sosa",
      iniciales: "MS",
      color: "#ff8a6b",
      puntaje: puntajeResena,
      fecha: "recién",
      texto: textoResena,
      meGusta: 0,
      comentarios: [],
    };

    setResenas([nueva, ...resenas]);
    setTextoResena("");
    setPuntajeResena(0);
  };

  // "Recientes" muestra primero la última; "Populares" ordena por me gusta
  const resenasOrdenadas =
    orden === "Populares"
      ? [...resenas].sort((a, b) => b.meGusta - a.meGusta)
      : resenas;

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto flex-1">
        <section className="px-16 py-10 flex items-start gap-12">
          {/* Columna izquierda: póster y acciones */}
          <div className="w-57.5 shrink-0 flex flex-col gap-3.5">
            <Poster
              titulo="Lo que queda"
              color="#ff2db4"
              tituloArriba
              className="w-57.5 h-86.25"
            />

            <div className="flex gap-4 font-karla font-bold text-xs text-apagado">
              <span className="flex items-center gap-1.25">
                <LuEye className="w-3.5 h-3.5" /> 1,2 k
              </span>
              <span className="flex items-center gap-1.25">
                <LuHeart className="w-3.5 h-3.5" /> 312
              </span>
              <span className="flex items-center gap-1.25">
                <LuMessageSquare className="w-3.5 h-3.5" /> 128
              </span>
            </div>

            <div className="py-1 rounded-md bg-superficie border border-borde flex flex-col">
              <button
                onClick={() => setEnFavoritos(!enFavoritos)}
                className="px-4 py-3 border-b border-borde flex items-center gap-2.5 cursor-pointer"
              >
                <LuHeart
                  className={`w-4 h-4 ${enFavoritos ? "fill-magenta text-magenta" : "text-texto-sec"
                    }`}
                />
                <span className="font-karla font-bold text-sm text-texto">
                  {enFavoritos ? "En tus favoritos" : "Agregar a favoritos"}
                </span>
                <span className="flex-1" />
                <span className="font-karla text-xs text-apagado">
                  {enFavoritos ? "3/4" : "2/4"}
                </span>
              </button>

              <div className="px-4 py-3 border-b border-borde flex items-center gap-2.5">
                <span className="font-karla font-bold text-sm text-texto">
                  Tu puntaje
                </span>
                <span className="flex-1" />
                <Estrellas
                  puntaje={miPuntaje}
                  className="w-4 h-4"
                  alElegir={setMiPuntaje}
                />
              </div>

              <button className="px-4 py-3 flex items-center gap-2.5 cursor-pointer">
                <LuShare className="w-4 h-4 text-texto-sec" />
                <span className="font-karla font-bold text-sm text-texto">
                  Compartir
                </span>
              </button>
            </div>

            <a
              href="https://www.youtube.com/@ORTMedios"
              target="_blank"
              className="w-full px-4 py-2.5 rounded bg-texto flex items-center justify-center gap-2 font-karla font-bold text-sm text-fondo hover:opacity-90 transition-opacity"
            >
              <LuPlay className="w-4 h-4 fill-fondo" />
              Ver en YouTube
            </a>
          </div>

          {/* Columna del medio: info */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="font-slab font-bold text-[32px] text-texto">
                Lo que queda
              </h1>
              <span className="font-karla text-lg text-texto-sec">2025</span>
            </div>

            <p className="font-karla text-base text-texto-sec">
              Dirigido por{" "}
              <Link to="/cuenta" className="font-bold text-texto hover:underline">
                Martina Sosa
              </Link>
            </p>

            <div className="flex gap-1.5">
              {etiquetas.map((etiqueta) => (
                <span
                  key={etiqueta}
                  className="px-2.5 py-1.25 rounded-full bg-elevado font-karla font-bold text-xs text-texto-sec"
                >
                  {etiqueta}
                </span>
              ))}
            </div>

            <p className="font-karla text-base leading-[1.6] text-texto-sec">
              Los Sosa son una familia extraña, y luego de que un abuelo lejano
              fallezca y deje una fortuna sin declarar a quien, como se logra
              mantener la union? dea
            </p>

            {/* Tabs Equipo / Detalles */}
            <div className="flex gap-6 border-b border-borde">
              {["Equipo", "Detalles"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className="flex flex-col gap-2 cursor-pointer"
                >
                  <span
                    className={`font-karla font-bold text-sm ${tab === item ? "text-texto" : "text-texto-sec"
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

            {tab === "Equipo" ? (
              <div className="flex flex-col gap-2.5">
                {equipo.map((integrante) => (
                  <div key={integrante.id} className="flex items-center gap-2">
                    <span className="w-27.5 font-karla text-[13px] text-apagado">
                      {integrante.rol}
                    </span>
                    {integrante.nombres.map((nombre) => (
                      <Link
                        key={nombre}
                        to="/perfil"
                        className="px-2.5 py-1.25 rounded bg-elevado font-karla font-medium text-[13px] text-texto hover:bg-borde transition-colors"
                      >
                        {nombre}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {detalles.map((detalle) => (
                  <div key={detalle.id} className="flex items-center gap-2">
                    <span className="w-27.5 font-karla text-[13px] text-apagado">
                      {detalle.label}
                    </span>
                    <span className="font-karla font-medium text-[13px] text-texto">
                      {detalle.valor}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Comentarios del equipo */}
            <div className="flex flex-col gap-2.5">
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-texto-sec">
                Comentarios del equipo
              </span>
              <div className="h-px w-full bg-borde" />
            </div>

            {comentariosEquipo.map((comentario) => (
              <div key={comentario.id} className="flex items-start gap-3">
                <Avatar iniciales={comentario.iniciales} color={comentario.color} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-karla font-bold text-sm text-texto">
                      {comentario.nombre}
                    </span>
                    <span className="px-2.5 py-1.25 rounded-full bg-elevado font-karla font-bold text-xs text-texto-sec">
                      {comentario.rol}
                    </span>
                  </div>
                  <p className="font-karla text-sm leading-[1.55] text-texto-sec">
                    {comentario.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha: puntaje y publicado por */}
          <aside className="w-62.5 shrink-0 flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Puntaje promedio
              </span>
              <div className="flex items-center gap-2.5">
                <span className="font-slab font-bold text-[28px] text-texto">
                  4.6
                </span>
                <Estrellas puntaje={5} className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-end gap-0.75">
                {barras.map((alto, index) => (
                  <div
                    key={index}
                    style={{ height: alto }}
                    className={`w-5 rounded-[1px] ${index >= 7 ? "bg-coral" : "bg-elevado"
                      }`}
                  />
                ))}
              </div>
              <span className="font-karla text-[13px] text-apagado">
                128 reseñas
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-karla font-bold text-[11px] tracking-[1.1px] text-apagado">
                Publicado por
              </span>
              <Link to="/cuenta" className="flex items-center gap-2.5">
                <Avatar iniciales="MS" color="#ff8a6b" className="w-7 h-7 text-[10px]" />
                <span className="font-karla font-bold text-[13px] text-texto">
                  @msosa
                </span>
              </Link>
            </div>
          </aside>
        </section>

        {/* Reseñas */}
        <section className="px-16 pt-2 pb-12 flex flex-col gap-1">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-slab font-semibold text-xl text-texto">
                Reseñas
              </h2>
              <span className="font-karla text-[13px] text-apagado">
                {resenas.length}
              </span>
            </div>
            <div className="flex gap-4.5">
              {["Populares", "Recientes"].map((item) => (
                <button
                  key={item}
                  onClick={() => setOrden(item)}
                  className={`font-karla font-bold text-[13px] cursor-pointer ${orden === item ? "text-texto" : "text-texto-sec"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-borde" />

          {/* Escribir reseña */}
          <div className="py-4">
            <div className="px-3.5 py-3 rounded-md bg-superficie border border-borde flex items-center gap-3.5">
              <Avatar iniciales="MS" color="#ff8a6b" />
              <input
                type="text"
                value={textoResena}
                onChange={(e) => setTextoResena(e.target.value)}
                placeholder="Escribí tu reseña de Lo que queda…"
                className="flex-1 bg-transparent outline-none font-karla text-[15px] text-texto placeholder:text-apagado"
              />
              <Estrellas
                puntaje={puntajeResena}
                className="w-4.5 h-4.5"
                alElegir={setPuntajeResena}
              />
              <button
                onClick={publicarResena}
                className="px-4 py-2.5 rounded bg-texto font-karla font-bold text-sm text-fondo hover:opacity-90 transition-opacity cursor-pointer"
              >
                Publicar
              </button>
            </div>
          </div>

          {resenasOrdenadas.map((resena) => (
            <div
              key={resena.id}
              className="py-4.5 border-b border-borde flex items-start gap-3.5"
            >
              <Avatar iniciales={resena.iniciales} color={resena.color} />

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-karla text-[13px] text-apagado">
                    Reseña de{" "}
                    <span className="font-bold text-texto">{resena.nombre}</span>
                  </span>
                  <Estrellas puntaje={resena.puntaje} />
                  <span className="font-karla text-xs text-apagado">
                    {resena.fecha}
                  </span>
                </div>

                <p className="font-karla text-[15px] leading-[1.55] text-texto">
                  {resena.texto}
                </p>

                <div className="flex items-center gap-4.5 font-karla font-bold text-xs text-texto-sec">
                  <span className="flex items-center gap-1.5">
                    <LuHeart className="w-3.5 h-3.5" /> {resena.meGusta} me gusta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuMessageSquare className="w-3.5 h-3.5" />{" "}
                    {resena.comentarios.length} comentarios
                  </span>
                  <button className="cursor-pointer hover:text-texto">
                    Responder
                  </button>
                </div>

                {resena.comentarios.length > 0 && (
                  <div className="pl-4 pt-1.5 border-l-2 border-borde flex flex-col gap-3">
                    {resena.comentarios.map((comentario) => (
                      <div key={comentario.id} className="flex items-start gap-2.5">
                        <Avatar
                          iniciales={comentario.iniciales}
                          color={comentario.color}
                          className="w-6.5 h-6.5 text-[9px]"
                        />
                        <div className="flex flex-col gap-0.75">
                          <span className="font-karla font-bold text-[13px] text-texto">
                            {comentario.nombre}
                          </span>
                          <p className="font-karla text-sm leading-normal text-texto-sec">
                            {comentario.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
