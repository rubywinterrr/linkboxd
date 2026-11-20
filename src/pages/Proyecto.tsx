import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuEye, LuHeart, LuMessageSquare, LuPlay } from "react-icons/lu";
import Avatar from "../components/Avatar";
import Estrellas from "../components/Estrellas";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Poster from "../components/Poster";
import useUsuarioContext from "../hooks/useUsuarioContext";
import { apiRequest, type ApiProject, type ApiReview, type ApiUser } from "../utils/api";

type ProjectDetail = {
  project: ApiProject;
  author: ApiUser;
  team: (ApiProject["equipo"][number] & { user: ApiUser })[];
  ratingAverage: number;
  ratingCount: number;
  ratingHistogram: number[];
  reviewCount: number;
  favoriteCount: number;
  viewCount: number;
  isFavorite: boolean;
  myRating: number | null;
};

const posterColors = ["#ff2db4", "#1c1921", "#ff8a6b", "#2a0f1e", "#8b3dff"];

function initials(user: ApiUser): string {
  return `${user.nombre[0] ?? ""}${user.apellido[0] ?? ""}`.toUpperCase();
}

export default function Proyecto() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { usuario, cargando: cargandoSesion } = useUsuarioContext();
  const [fallbackId, setFallbackId] = useState("");
  const id = projectId ?? fallbackId;
  const [detalle, setDetalle] = useState<ProjectDetail | null>(null);
  const [resenas, setResenas] = useState<ApiReview[]>([]);
  const [texto, setTexto] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [respuesta, setRespuesta] = useState<Record<string, string>>({});
  const [orden, setOrden] = useState<"Recientes" | "Populares">("Recientes");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState("");
  const loadingIds = useRef(new Set<string>());

  useEffect(() => {
    if (projectId) return;
    let active = true;
    apiRequest<{ data: ApiProject[] }>("/projects?limit=1")
      .then(({ data }) => {
        if (!active) return;
        if (!data[0]) throw new Error("Todavía no hay proyectos para mostrar");
        setFallbackId(data[0].id);
        navigate(`/proyecto/${data[0].id}`, { replace: true });
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "No se pudo encontrar el proyecto");
          setCargando(false);
        }
      });
    return () => { active = false; };
  }, [navigate, projectId]);

  useEffect(() => {
    if (!id || loadingIds.current.has(id)) return;
    loadingIds.current.add(id);
    Promise.all([
      apiRequest<ProjectDetail>(`/projects/${encodeURIComponent(id)}`),
      apiRequest<{ data: ApiReview[] }>(`/projects/${encodeURIComponent(id)}/reviews`),
    ])
      .then(([project, reviewResult]) => {
        setDetalle(project);
        setResenas(reviewResult.data);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "No se pudo cargar el proyecto");
      })
      .finally(() => {
        loadingIds.current.delete(id);
        setLoadedId(id);
        setCargando(false);
      });
  }, [id]);

  const resenasOrdenadas = useMemo(() => (
    [...resenas].sort((a, b) => orden === "Populares"
      ? b.likeCount - a.likeCount
      : b.createdAt.localeCompare(a.createdAt))
  ), [orden, resenas]);

  const toggleFavorito = async () => {
    if (!detalle) return;
    setError(null);
    try {
      const adding = !detalle.isFavorite;
      await apiRequest<void>(`/projects/${detalle.project.id}/favorite`, {
        method: adding ? "PUT" : "DELETE",
      });
      setDetalle((current) => current ? {
        ...current,
        isFavorite: adding,
        favoriteCount: current.favoriteCount + (adding ? 1 : -1),
      } : current);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar favoritos");
    }
  };

  const guardarPuntaje = async (value: number) => {
    if (!detalle) return;
    setError(null);
    try {
      await apiRequest(`/projects/${detalle.project.id}/rating`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      setDetalle((current) => current ? { ...current, myRating: value } : current);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el puntaje");
    }
  };

  const publicarResena = async () => {
    if (!detalle || !texto.trim() || puntaje < 1) return;
    setError(null);
    try {
      const { review } = await apiRequest<{ review: ApiReview }>(
        `/projects/${detalle.project.id}/reviews`,
        { method: "POST", body: JSON.stringify({ value: puntaje, text: texto }) },
      );
      setResenas((current) => [review, ...current]);
      setDetalle((current) => current ? { ...current, reviewCount: current.reviewCount + 1 } : current);
      setTexto("");
      setPuntaje(0);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo publicar la reseña");
    }
  };

  const toggleMeGusta = async (review: ApiReview) => {
    try {
      const result = await apiRequest<{ likeCount: number; isLiked: boolean }>(
        `/reviews/${review.id}/like`,
        { method: review.isLiked ? "DELETE" : "PUT" },
      );
      setResenas((current) => current.map((item) => item.id === review.id
        ? { ...item, ...result }
        : item));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el me gusta");
    }
  };

  const responder = async (review: ApiReview) => {
    const text = respuesta[review.id]?.trim();
    if (!text) return;
    try {
      const { reply } = await apiRequest<{ reply: ApiReview["replies"][number] }>(
        `/reviews/${review.id}/replies`,
        { method: "POST", body: JSON.stringify({ text }) },
      );
      setResenas((current) => current.map((item) => item.id === review.id
        ? { ...item, replies: [...item.replies, reply] }
        : item));
      setRespuesta((current) => ({ ...current, [review.id]: "" }));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo responder");
    }
  };

  if (cargando || (id && loadedId !== id) || (cargandoSesion && !detalle)) {
    return <><Navbar /><p className="p-16 text-texto-sec">Cargando proyecto...</p><Footer /></>;
  }
  if (!detalle) {
    return <><Navbar /><p role="alert" className="p-16 text-red-400">{error ?? "No se encontró el proyecto"}</p><Footer /></>;
  }

  const { project } = detalle;
  const colorIndex = project.titulo.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % posterColors.length;
  const color = posterColors[colorIndex] ?? "#ff2db4";

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto flex-1">
        <section className="px-8 md:px-16 py-10 flex flex-col md:flex-row items-start gap-8 md:gap-12">
          <div className="w-56 shrink-0 flex flex-col gap-3.5">
            <Poster titulo={project.titulo} color={color} tituloArriba className="w-56 h-84" />
            <div className="flex gap-4 font-karla font-bold text-xs text-apagado">
              <span className="flex items-center gap-1"><LuEye /> {detalle.viewCount}</span>
              <span className="flex items-center gap-1"><LuHeart /> {detalle.favoriteCount}</span>
              <span className="flex items-center gap-1"><LuMessageSquare /> {detalle.reviewCount}</span>
            </div>
            <div className="py-1 rounded-md bg-superficie border border-borde flex flex-col">
              <button onClick={toggleFavorito} className="px-4 py-3 border-b border-borde flex items-center gap-2.5 text-left">
                <LuHeart className={detalle.isFavorite ? "fill-magenta text-magenta" : "text-texto-sec"} />
                <span className="font-karla font-bold text-sm">{detalle.isFavorite ? "En tus favoritos" : "Agregar a favoritos"}</span>
              </button>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="font-karla font-bold text-sm">Tu puntaje</span>
                <Estrellas puntaje={detalle.myRating ?? 0} className="w-4 h-4" alElegir={guardarPuntaje} />
              </div>
            </div>
            <a href={project.url} target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded bg-texto flex items-center justify-center gap-2 font-karla font-bold text-sm text-fondo">
              <LuPlay /> Ver proyecto
            </a>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="font-slab font-bold text-[32px]">{project.titulo}</h1>
              <span className="font-karla text-lg text-texto-sec">{project.anio}</span>
            </div>
            <p className="font-karla text-base text-texto-sec">
              Publicado por <Link to={`/perfil/${detalle.author.id}`} className="font-bold text-texto hover:underline">@{detalle.author.nombreUsuario}</Link>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[project.tipo, project.genero, project.duracionMinutos ? `${project.duracionMinutos} min` : null]
                .filter(Boolean)
                .map((label) => <span key={label} className="px-2.5 py-1.25 rounded-full bg-elevado font-karla font-bold text-xs text-texto-sec">{label}</span>)}
            </div>
            <p className="font-karla text-base leading-[1.6] text-texto-sec">{project.descripcion}</p>

            <h2 className="font-karla font-bold text-sm border-b border-borde pb-2">Equipo</h2>
            {detalle.team.map((member) => (
              <div key={member.userId} className="flex flex-wrap items-center gap-2">
                <Link to={`/perfil/${member.user.id}`} className="font-karla font-bold text-sm hover:underline">
                  {member.user.nombre} {member.user.apellido}
                </Link>
                {member.roles.map((role) => <span key={role} className="px-2 py-1 rounded bg-elevado text-xs text-texto-sec">{role}</span>)}
                {member.comment && <p className="w-full text-sm text-texto-sec">{member.comment}</p>}
              </div>
            ))}

            <div className="mt-4 flex items-center gap-3">
              <span className="font-karla text-sm text-texto-sec">Puntaje promedio</span>
              <strong className="font-slab text-2xl">{detalle.ratingAverage.toFixed(1)}</strong>
              <span className="text-sm text-apagado">({detalle.ratingCount} puntajes)</span>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 pb-12 flex flex-col gap-3">
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-between">
            <h2 className="font-slab font-semibold text-xl">Reseñas <span className="text-sm text-apagado">{resenas.length}</span></h2>
            <div className="flex gap-4">
              {(["Populares", "Recientes"] as const).map((item) => (
                <button key={item} onClick={() => setOrden(item)} className={orden === item ? "font-bold" : "text-texto-sec"}>{item}</button>
              ))}
            </div>
          </div>
          {usuario && (
            <div className="py-3 flex flex-wrap items-center gap-3 border-b border-borde">
              <input value={texto} onChange={(event) => setTexto(event.target.value)} placeholder={`Escribí tu reseña de ${project.titulo}`} className="flex-1 min-w-48 bg-transparent outline-none" />
              <Estrellas puntaje={puntaje} alElegir={setPuntaje} />
              <button onClick={publicarResena} className="px-4 py-2 rounded bg-texto text-fondo font-bold">Publicar</button>
            </div>
          )}
          {resenasOrdenadas.map((review) => (
            <article key={review.id} className="py-4 border-b border-borde flex gap-3">
              <Avatar iniciales={initials(review.user)} color={posterColors[0] ?? "#ff2db4"} />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-texto-sec">
                  <span className="font-bold text-texto">{review.user.nombre} {review.user.apellido}</span>
                  <Estrellas puntaje={review.value} />
                  <time>{new Date(review.createdAt).toLocaleDateString()}</time>
                </div>
                <p>{review.text}</p>
                <button onClick={() => toggleMeGusta(review)} className={review.isLiked ? "text-magenta" : "text-texto-sec"}>
                  <LuHeart className="inline mr-1" />{review.likeCount} me gusta
                </button>
                {review.replies.map((reply) => (
                  <p key={reply.id} className="ml-4 border-l border-borde pl-3 text-sm text-texto-sec">
                    <strong>{reply.user.nombre}:</strong> {reply.text}
                  </p>
                ))}
                {usuario && (
                  <div className="flex gap-2">
                    <input value={respuesta[review.id] ?? ""} onChange={(event) => setRespuesta((current) => ({ ...current, [review.id]: event.target.value }))} placeholder="Responder..." className="flex-1 bg-transparent border-b border-borde outline-none text-sm" />
                    <button onClick={() => responder(review)} className="text-sm font-bold">Responder</button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {!resenas.length && <p className="py-6 text-texto-sec">Todavía no hay reseñas.</p>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
