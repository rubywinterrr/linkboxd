import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { LuDownload, LuEye, LuMail, LuPhone, LuStar } from "react-icons/lu";
import Avatar from "../components/Avatar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Poster from "../components/Poster";
import useUsuarioContext from "../hooks/useUsuarioContext";
import { apiRequest, type ApiProject, type ApiUser } from "../utils/api";

type UserProfileResponse = { user: ApiUser; projects: ApiProject[] };
const colors = ["#ff5c9a", "#1c1921", "#ff8a6b", "#2a0f1e"];

function initials(user: ApiUser): string {
  return `${user.nombre[0] ?? ""}${user.apellido[0] ?? ""}`.toUpperCase();
}

export default function PerfilAlumno() {
  const { userId } = useParams();
  const { usuario } = useUsuarioContext();
  const [perfil, setPerfil] = useState<ApiUser | null>(null);
  const [proyectos, setProyectos] = useState<ApiProject[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    apiRequest<UserProfileResponse>(`/users/${encodeURIComponent(userId)}`)
      .then(({ user, projects }) => {
        if (!active) return;
        setPerfil(user);
        setProyectos(projects);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el perfil");
      })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, [userId]);

  if (!userId) return <Navigate to="/inicio" replace />;

  const verCv = async () => {
    if (!perfil?.profile?.cv) return;
    const newTab = window.open("about:blank", "_blank");
    try {
      const file = await apiRequest<Blob>(`/users/${encodeURIComponent(perfil.id)}/cv`, {}, "blob");
      const url = URL.createObjectURL(file);
      if (newTab) newTab.location.href = url;
      else window.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause: unknown) {
      newTab?.close();
      setError(cause instanceof Error ? cause.message : "No se pudo abrir el CV");
    }
  };

  if (cargando) return <><Navbar /><p className="p-8 text-texto-sec">Cargando perfil...</p><Footer /></>;
  if (!perfil) return <><Navbar /><p role="alert" className="p-8 text-red-400">{error ?? "No se encontró el perfil"}</p><Footer /></>;

  const ownProfile = perfil.profile;
  const hasCv = Boolean(ownProfile?.cv && usuario);

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto flex-1 px-8 md:px-16">
        <section className="py-10 flex flex-wrap items-center gap-6">
          <Avatar iniciales={initials(perfil)} color="#ff5c9a" className="w-24 h-24 text-[34px]" />
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-slab font-bold text-[26px]">{perfil.nombre} {perfil.apellido}</h1>
              {perfil.tipo === "medios" && <span className="rounded-full bg-magenta px-2 py-1 text-[11px] font-bold text-fondo">Medios</span>}
            </div>
            <p className="text-sm text-texto-sec">@{perfil.nombreUsuario} {ownProfile?.year ? `· ${ownProfile.year}° año` : ""} {ownProfile?.specialty ? `· ${ownProfile.specialty}` : ""}</p>
            <p className="mt-2 max-w-xl text-sm text-texto-sec">{ownProfile?.bio || "Este usuario todavía no agregó una descripción."}</p>
            <div className="mt-3 flex gap-2">
              {hasCv && <button onClick={verCv} className="flex items-center gap-2 rounded bg-texto px-4 py-2 text-sm font-bold text-fondo"><LuEye /> Ver CV</button>}
              {perfil.email && <a href={`mailto:${perfil.email}`} className="flex items-center gap-2 rounded border border-borde px-4 py-2 text-sm font-bold"><LuMail /> Contactar</a>}
            </div>
          </div>
          <div className="text-center"><strong className="block font-slab text-xl">{proyectos.length}</strong><span className="text-[11px] text-apagado">Proyectos</span></div>
        </section>

        {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
        <section className="grid gap-10 py-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="mb-3 text-xs font-bold tracking-wider text-texto-sec">PROYECTOS</h2>
            {proyectos.map((project, index) => {
              const projectRoles = project.equipo.find((member) => member.userId === perfil.id)?.roles ?? [];
              const color = colors[index % colors.length] ?? "#ff5c9a";
              return (
                <Link key={project.id} to={`/proyecto/${project.id}`} className="flex items-center gap-4 border-b border-borde py-3">
                  <Poster titulo={project.titulo} color={color} tituloArriba className="w-14 h-20" />
                  <div className="flex-1">
                    <strong>{project.titulo}</strong>
                    <p className="text-sm text-apagado">{project.tipo} · {project.anio}</p>
                    <p className="text-sm">Rol: {projectRoles.join(" · ") || (project.publicadoPor === perfil.id ? "Autor" : "Integrante")}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm"><LuStar className="fill-coral text-coral" />{project.ratingAverage.toFixed(1)}</span>
                </Link>
              );
            })}
            {!proyectos.length && <p className="text-sm text-apagado">Todavía no hay proyectos.</p>}
          </div>

          <aside className="h-fit rounded-md border border-borde bg-superficie p-5 space-y-3">
            <h2 className="text-xs font-bold tracking-wider text-texto-sec">PERFIL</h2>
            {hasCv ? (
              <>
                <div className="rounded bg-elevado p-3"><strong className="text-sm">{ownProfile?.cv?.originalName}</strong><p className="text-xs text-apagado">{Math.max(1, Math.round((ownProfile?.cv?.size ?? 0) / 1024))} KB</p></div>
                <button onClick={verCv} className="flex w-full items-center justify-center gap-2 rounded border border-borde py-2 text-sm font-bold"><LuDownload /> Descargar / ver CV</button>
              </>
            ) : <p className="text-sm text-apagado">{usuario ? "No hay un CV compartido en este perfil." : "Iniciá sesión para ver el CV si está disponible."}</p>}
            <h3 className="pt-2 text-xs font-bold tracking-wider text-apagado">EXPERIENCIA</h3>
            {ownProfile?.experiences.map((experience) => (
              <div key={experience.id} className="flex gap-3 text-sm">
                <strong className="text-coral">{experience.year}</strong>
                <span><strong>{experience.position}</strong><br /><span className="text-texto-sec">{experience.place}</span></span>
              </div>
            ))}
            <h3 className="pt-2 text-xs font-bold tracking-wider text-apagado">HERRAMIENTAS</h3>
            <div className="flex flex-wrap gap-1.5">{ownProfile?.tools.map((tool) => <span key={tool} className="rounded-full bg-elevado px-2.5 py-1 text-xs">{tool}</span>)}</div>
            {ownProfile?.phone && <p className="flex items-center gap-2 text-sm"><LuPhone />{ownProfile.phone}</p>}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
