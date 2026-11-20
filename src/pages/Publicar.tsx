import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import useUsuarioContext from "../hooks/useUsuarioContext";
import { apiRequest, type ApiUser } from "../utils/api";

type Teammate = {
  id: string;
  nombre: string;
  nombreUsuario: string;
};

const tipos = [
  "Cortometraje",
  "Podcast y radio",
  "Session Bis",
  "Cross Media",
  "Animación",
  "Documental",
  "Otro",
];
const roles = ["Dirección", "Guión", "Sonido", "Fotografía", "Producción", "Montaje", "Arte"];
const inputClass =
  "w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500";

export default function Publicar() {
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState(tipos[0] ?? "Cortometraje");
  const [titulo, setTitulo] = useState("");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [genero, setGenero] = useState("");
  const [duracion, setDuracion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comentario, setComentario] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ApiUser[]>([]);
  const [equipo, setEquipo] = useState<(Teammate & { role: string })[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { usuario, esMedios, cargando: cargandoSesion } = useUsuarioContext();

  useEffect(() => {
    const query = busqueda.trim();
    if (query.length < 2) return;

    const timer = window.setTimeout(() => {
      apiRequest<{ data: ApiUser[] }>(
        `/users?q=${encodeURIComponent(query)}&type=medios`,
      )
        .then(({ data }) => setResultados(data))
        .catch((cause: unknown) => {
          setError(cause instanceof Error ? cause.message : "No se pudo buscar compañeros");
        });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [busqueda]);

  if (cargandoSesion) return <p className="p-8 text-texto-sec">Cargando sesión...</p>;
  if (!esMedios) return <Navigate to="/inicio" replace />;

  const agregarIntegrante = (user: ApiUser) => {
    if (equipo.some((member) => member.id === user.id)) return;
    setEquipo((members) => [
      ...members,
      {
        id: user.id,
        nombre: `${user.nombre} ${user.apellido}`,
        nombreUsuario: user.nombreUsuario,
        role: roles[0] ?? "Dirección",
      },
    ]);
    setBusqueda("");
    setResultados([]);
  };

  const publicar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { project } = await apiRequest<{ project: { id: string } }>("/projects", {
        method: "POST",
        body: JSON.stringify({
          titulo,
          tipo,
          anio: Number(anio),
          genero,
          duracionMinutos: duracion ? Number(duracion) : null,
          descripcion,
          url,
          equipo: [
            ...equipo.map((member) => ({ userId: member.id, roles: [member.role] })),
            ...(usuario
              ? [{ userId: usuario.id, roles: ["Autor"], comment: comentario }]
              : []),
          ],
        }),
      });
      navigate(`/proyecto/${project.id}`);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo publicar el proyecto");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] text-white flex justify-center py-12 px-6 font-sans">
        <div className="w-full max-w-4xl">
          <div className="mb-10">
            <p className="text-zinc-400 text-sm mb-2">Mi perfil / Publicar proyecto</p>
            <h1 className="text-3xl font-bold mb-2">Publicar proyecto</h1>
            <p className="text-zinc-400 text-sm">
              Se suma a tu perfil y al de tus compañeros.
            </p>
          </div>

          <form onSubmit={publicar} className="space-y-6">
            {error && (
              <p role="alert" className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">
                {error}
              </p>
            )}

            <label className="block space-y-2 text-sm font-semibold text-zinc-300">
              Link del proyecto
              <input
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-zinc-300">Tipo de contenido</span>
              <div className="flex flex-wrap gap-2">
                {tipos.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTipo(option)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      tipo === option ? "bg-white text-black" : "border border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-2 text-sm font-semibold text-zinc-300">
              Título
              <input required maxLength={160} value={titulo} onChange={(event) => setTitulo(event.target.value)} className={inputClass} />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-2 text-xs font-semibold text-gray-400">
                Año
                <input type="number" min={1900} max={2200} required value={anio} onChange={(event) => setAnio(event.target.value)} className={inputClass} />
              </label>
              <label className="space-y-2 text-xs font-semibold text-gray-400">
                Género
                <input maxLength={80} value={genero} onChange={(event) => setGenero(event.target.value)} className={inputClass} />
              </label>
              <label className="space-y-2 text-xs font-semibold text-gray-400">
                Duración (minutos)
                <input type="number" min={1} max={1000} value={duracion} onChange={(event) => setDuracion(event.target.value)} className={inputClass} />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-semibold text-zinc-300">
              Descripción
              <textarea required maxLength={5000} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} className={`${inputClass} min-h-28`} />
            </label>

            <div className="space-y-2">
              <label htmlFor="buscar-companero" className="text-sm font-semibold text-zinc-300">
                Buscar compañeros de Medios
              </label>
              <input
                id="buscar-companero"
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value);
                  if (event.target.value.trim().length < 2) setResultados([]);
                }}
                className={inputClass}
                placeholder="Escribí al menos 2 caracteres del nombre de usuario"
              />
              {resultados.length > 0 && (
                <ul className="bg-[#1a1a1a] border border-zinc-800 rounded-md max-h-40 overflow-y-auto">
                  {resultados
                    .filter((user) => user.id !== usuario?.id)
                    .filter((user) => !equipo.some((member) => member.id === user.id))
                    .map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => agregarIntegrante(user)}
                          className="w-full text-left p-2.5 hover:bg-zinc-800 text-sm text-zinc-300"
                        >
                          {user.nombre} {user.apellido} · @{user.nombreUsuario}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
              {equipo.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 bg-zinc-900 p-2.5 rounded">
                  <span className="text-sm">{member.nombre} · @{member.nombreUsuario}</span>
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(event) => setEquipo((members) => members.map((item) => item.id === member.id ? { ...item, role: event.target.value } : item))}
                      className="bg-zinc-900 border border-zinc-700 rounded p-1 text-xs"
                      aria-label={`Rol de ${member.nombre}`}
                    >
                      {roles.map((role) => <option key={role}>{role}</option>)}
                    </select>
                    <button type="button" onClick={() => setEquipo((members) => members.filter((item) => item.id !== member.id))} aria-label={`Quitar a ${member.nombre}`}>
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label className="block space-y-2 text-sm font-semibold text-zinc-300">
              Tu comentario sobre el proyecto (opcional)
              <textarea maxLength={1000} value={comentario} onChange={(event) => setComentario(event.target.value)} className={`${inputClass} min-h-20`} />
            </label>

            <div className="flex justify-between items-center border-t border-zinc-800 pt-6">
              <button type="button" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white">
                Cancelar
              </button>
              <button type="submit" disabled={cargando} className="bg-white text-black px-6 py-2.5 rounded-md font-semibold text-sm disabled:opacity-50">
                {cargando ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
