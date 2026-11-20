import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { LuDownload, LuMail, LuPencil, LuPhone, LuStar, LuUpload } from "react-icons/lu";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Poster from "../components/Poster";
import useUsuarioContext from "../hooks/useUsuarioContext";
import { apiRequest, type ApiProject, type ApiReview, type ApiUser } from "../utils/api";

type OwnProfile = NonNullable<ApiUser["profile"]>;
const colors = ["#2a0f1e", "#ff8a6b", "#1c1921", "#ff2db4"];

function posterColor(title: string): string {
  const index = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[index % colors.length] ?? "#2a0f1e";
}

export default function Cuenta() {
  const { usuario, esMedios, cargando: cargandoSesion } = useUsuarioContext();
  const [perfil, setPerfil] = useState<OwnProfile | null>(null);
  const [proyectos, setProyectos] = useState<ApiProject[]>([]);
  const [favoritos, setFavoritos] = useState<ApiProject[]>([]);
  const [resenas, setResenas] = useState<ApiReview[]>([]);
  const [tab, setTab] = useState("Perfil");
  const [editando, setEditando] = useState(false);
  const [bio, setBio] = useState("");
  const [year, setYear] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [tools, setTools] = useState("");
  const [experiences, setExperiences] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    Promise.all([
      apiRequest<{ user: ApiUser; projects: ApiProject[] }>(`/users/${encodeURIComponent(usuario.id)}`),
      apiRequest<{ data: ApiProject[] }>("/users/me/favorites"),
    ])
      .then(([ownProfile, favoriteList]) => {
        const profile = ownProfile.user.profile;
        if (!profile) throw new Error("La API no devolvió los datos del perfil");
        setPerfil(profile);
        setProyectos(ownProfile.projects);
        setFavoritos(favoriteList.data);
        setBio(profile.bio);
        setYear(profile.year?.toString() ?? "");
        setSpecialty(profile.specialty);
        setPhone(profile.phone ?? "");
        setTools(profile.tools.join(", "));
        setExperiences(profile.experiences.map((item) => `${item.year}|${item.position}|${item.place}`).join("\n"));
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudo cargar el perfil"))
      .finally(() => setCargando(false));
  }, [usuario]);

  const cargarResenas = async () => {
    if (resenas.length || !usuario) return;
    try {
      const { data } = await apiRequest<{ data: ApiReview[] }>(`/users/${encodeURIComponent(usuario.id)}/reviews`);
      setResenas(data);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las reseñas");
    }
  };

  if (cargandoSesion) return <><Navbar /><p className="p-8 text-texto-sec">Cargando sesión...</p><Footer /></>;
  if (!usuario) return <Navigate to="/iniciosesion" replace />;

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const parsedExperiences = experiences.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const [experienceYear, position, place] = line.split("|").map((part) => part.trim());
        return { year: Number(experienceYear), position, place };
      });
      const { user } = await apiRequest<{ user: ApiUser }>("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          year: year ? Number(year) : null,
          specialty,
          phone: phone || null,
          tools: tools.split(",").map((tool) => tool.trim()).filter(Boolean),
          experiences: parsedExperiences,
        }),
      });
      if (user.profile) setPerfil(user.profile);
      setEditando(false);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el perfil");
    }
  };

  const subirCv = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { user } = await apiRequest<{ user: ApiUser }>("/users/me/cv", {
        method: "PUT",
        body: form,
      });
      if (user.profile) setPerfil(user.profile);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el CV");
    }
  };

  const descargarCv = async () => {
    if (!perfil?.cv) return;
    try {
      const blob = await apiRequest<Blob>(`/users/${encodeURIComponent(usuario.id)}/cv?download=true`, {}, "blob");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = perfil.cv.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar el CV");
    }
  };

  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto flex-1 px-8 md:px-16">
        <section className="py-10 flex flex-wrap items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-coral flex items-center justify-center font-karla font-bold text-[34px] text-fondo shrink-0">
            {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <h1 className="font-slab font-bold text-[26px]">{usuario.nombre} {usuario.apellido}</h1>
              {esMedios && <span className="px-2 py-0.75 rounded-full bg-magenta font-karla font-bold text-[11px] text-fondo">Medios</span>}
            </div>
            <p className="font-karla text-sm text-texto-sec">@{usuario.nombreUsuario} {perfil?.year ? `· ${perfil.year}° año` : ""} {perfil?.specialty ? `· ${perfil.specialty}` : ""}</p>
            <p className="font-karla text-sm leading-normal text-texto-sec max-w-125">{perfil?.bio || "Todavía no agregaste una descripción."}</p>
            <div className="flex gap-2.5 pt-1.5">
              <button onClick={() => setEditando((value) => !value)} className="px-4 py-2.5 rounded border border-borde flex items-center gap-2 font-karla font-bold text-sm hover:bg-elevado">
                <LuPencil className="w-4 h-4" /> {editando ? "Cancelar edición" : "Editar perfil"}
              </button>
              {esMedios && perfil?.cv && (
                <button onClick={descargarCv} className="px-4 py-2.5 rounded bg-texto flex items-center gap-2 font-karla font-bold text-sm text-fondo">
                  <LuDownload className="w-4 h-4" /> Descargar CV
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex gap-5">
            {esMedios && <div className="text-center"><strong className="block font-slab text-xl">{proyectos.length}</strong><span className="text-[11px] text-apagado">Proyectos</span></div>}
            <div className="text-center"><strong className="block font-slab text-xl">{resenas.length}</strong><span className="text-[11px] text-apagado">Reseñas</span></div>
          </div>
        </section>

        {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
        {editando && (
          <form onSubmit={guardarPerfil} className="mb-8 grid gap-3 md:grid-cols-2 rounded-md border border-borde bg-superficie p-5">
            <label className="grid gap-1 text-sm">Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={1000} className="bg-fondo border border-borde rounded p-2" /></label>
            <label className="grid gap-1 text-sm">Año<input type="number" min={1} max={12} value={year} onChange={(event) => setYear(event.target.value)} className="bg-fondo border border-borde rounded p-2" /></label>
            <label className="grid gap-1 text-sm">Especialidad<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="bg-fondo border border-borde rounded p-2" /></label>
            <label className="grid gap-1 text-sm">Teléfono<input value={phone} onChange={(event) => setPhone(event.target.value)} className="bg-fondo border border-borde rounded p-2" /></label>
            <label className="grid gap-1 text-sm">Herramientas (separadas por coma)<input value={tools} onChange={(event) => setTools(event.target.value)} className="bg-fondo border border-borde rounded p-2" /></label>
            <label className="grid gap-1 text-sm">Experiencias (una por línea: año|puesto|lugar)<textarea value={experiences} onChange={(event) => setExperiences(event.target.value)} className="bg-fondo border border-borde rounded p-2" /></label>
            <button type="submit" className="justify-self-start rounded bg-texto px-4 py-2 font-bold text-fondo">Guardar perfil</button>
          </form>
        )}

        <div className="border-b border-borde flex gap-7">
          {["Perfil", "Reseñas"].map((item) => (
            <button key={item} onClick={() => { setTab(item); if (item === "Reseñas") void cargarResenas(); }} className={`pb-3 text-sm font-bold ${tab === item ? "border-b-2 border-magenta text-texto" : "text-texto-sec"}`}>{item}</button>
          ))}
        </div>

        {cargando ? <p className="py-8 text-texto-sec">Cargando perfil...</p> : tab === "Perfil" ? (
          <section className="py-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-8">
              <div>
                <h2 className="mb-3 text-xs font-bold tracking-wider text-texto-sec">FAVORITOS ({favoritos.length}/4)</h2>
                <div className="flex flex-wrap gap-4">
                  {favoritos.map((favorite) => (
                    <Link key={favorite.id} to={`/proyecto/${favorite.id}`}>
                      <Poster titulo={favorite.titulo} color={posterColor(favorite.titulo)} className="w-32 h-48" />
                    </Link>
                  ))}
                  {!favoritos.length && <p className="text-sm text-apagado">Todavía no hay favoritos.</p>}
                </div>
              </div>
              {esMedios && (
                <div>
                  <h2 className="mb-3 text-xs font-bold tracking-wider text-texto-sec">PROYECTOS</h2>
                  {proyectos.map((project) => (
                    <Link key={project.id} to={`/proyecto/${project.id}`} className="flex items-center gap-4 border-b border-borde py-3">
                      <Poster titulo={project.titulo} color={posterColor(project.titulo)} className="w-12 h-16" />
                      <div className="flex-1"><strong>{project.titulo}</strong><p className="text-sm text-apagado">{project.tipo} · {project.anio}</p></div>
                      <span className="flex items-center gap-1 text-sm"><LuStar className="fill-coral text-coral" />{project.ratingAverage.toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {esMedios && (
              <aside className="h-fit p-5 rounded-md bg-superficie border border-borde flex flex-col gap-3.5">
                <span className="font-bold text-xs tracking-wider text-texto-sec">CURRÍCULUM</span>
                {perfil?.cv ? (
                  <>
                    <div className="p-3 rounded bg-elevado flex items-center gap-3">
                      <span className="rounded bg-coral px-2 py-3 text-xs font-bold">PDF</span>
                      <div><strong className="text-sm">{perfil.cv.originalName}</strong><p className="text-xs text-apagado">{Math.max(1, Math.round(perfil.cv.size / 1024))} KB</p></div>
                    </div>
                    <button onClick={descargarCv} className="rounded border border-borde py-2 text-sm font-bold hover:bg-elevado">Descargar CV</button>
                  </>
                ) : <p className="text-sm text-apagado">Todavía no cargaste un CV.</p>}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-borde py-2 text-sm font-bold hover:bg-elevado">
                  <LuUpload /> {perfil?.cv ? "Reemplazar" : "Subir CV"}
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => { void subirCv(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                </label>
                <h3 className="mt-2 text-xs font-bold tracking-wider text-apagado">EXPERIENCIA</h3>
                {perfil?.experiences.map((experience) => (
                  <div key={experience.id} className="flex gap-3 text-sm">
                    <span className="font-bold text-coral">{experience.year}</span>
                    <span><strong>{experience.position}</strong><br /><span className="text-texto-sec">{experience.place}</span></span>
                  </div>
                ))}
                <h3 className="mt-2 text-xs font-bold tracking-wider text-apagado">HERRAMIENTAS</h3>
                <div className="flex flex-wrap gap-1.5">{perfil?.tools.map((tool) => <span key={tool} className="rounded-full bg-elevado px-2.5 py-1 text-xs">{tool}</span>)}</div>
                {perfil?.phone && <p className="flex items-center gap-2 text-sm"><LuPhone />{perfil.phone}</p>}
                {usuario.mail && <a className="flex items-center gap-2 text-sm" href={`mailto:${usuario.mail}`}><LuMail />{usuario.mail}</a>}
              </aside>
            )}
          </section>
        ) : (
          <section className="py-8 space-y-4">
            {resenas.map((review) => <Link key={review.id} to={`/proyecto/${review.projectId}`} className="block border-b border-borde py-4"><div className="flex items-center gap-2"><strong>{review.value}/5</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></div><p>{review.text}</p></Link>)}
            {!resenas.length && <p className="text-sm text-texto-sec">Todavía no hay reseñas.</p>}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
