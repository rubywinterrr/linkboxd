import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export type Compañeros = {
    nombreUser: string,
    rol: string
}

export default function Publicar () {
    const [ link, setLink ] = useState <string>("");
    const [ tipo, setTipo ] = useState <string>("Cortometraje");
    const [ titulo, setTitulo ] = useState <string>("");
    const [ año, setAño ] = useState <string>("");
    const [ genero, setGenero ] = useState <string>("");
    const [ duracion, setDuracion ] = useState <string>("");
    const [ descripcion, setDescripcion ] = useState <string>("");
    const [ compañeros, setCompañeros ] = useState <Compañeros[]>();
    const [ busqueda, setBusqueda ] = useState <string>("");
    const [ comentario, setComentario ] = useState <string>("");
    const [ imagen, setImagen ] = useState <string>("");
    const [ cargando, setCargando ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    const opciones = [
    'Cortometraje',
    'Podcast y radio',
    'Session Bis',
    'Cross Media',
    'Animación',
    'Documental',
    'Otro'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
    
            if (!link.trim() || !titulo.trim() || !descripcion.trim()) {
                setError('Por favor, completa los campos obligatorios (Link, Título y Descripción).');
                return;
            }
    
            setCargando(true);
    
            try {
                const token = localStorage.getItem('token');
            const response = await fetch('api/tu-endpoint-de-publicar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    link,
                    tipo,
                    titulo,
                    año,
                    genero,
                    duracion,
                    descripcion,
                    comentario,
                    imagen
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al publicar el proyecto');
            }

            navigate('/');
    
            } catch (err: unknown) {
                console.error('Error en publicar media:', err);
                setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
            } finally {
                setCargando(false);
            }
        };

        const handleBack = () => {
            navigate(-1);
        }
    
        useEffect(() => {
            fetch('apimaxiapuraterey')
            .then((response) => {
                if (!response.ok) {
                throw new Error('Error al conectar con la API');
                }
                return response.json();
            })
            .then((data: Compañeros[]) => {
                const alumnosMedios = data.filter(
                (usuario: any) => usuario.tipo === 'Alumno de medios'
                );
                setCompañeros(alumnosMedios);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            });
        }, []);

    return (
        <>
            <Navbar />
            <div className="w-full bg-[#0a0a0a] text-white flex justify-center py-12 px-6 font-sans min-h-screen">
                <div className="w-full max-w-4xl">
                    
                    <div className="mb-10">
                        <p className="text-zinc-400 text-sm mb-2">
                            Mi perfil  /  Publicar proyecto
                        </p>
                        <h1 className="text-3xl font-bold mb-2">Publicar proyecto</h1>
                        <p className="text-zinc-400 text-sm">
                            Se suma a tu perfil y a tu CV. Tus compañeros lo van a ver también en el suyo.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="link" className="text-sm font-semibold text-zinc-300">Link de youtube</label>
                                <input
                                    type="text" 
                                    id="link" 
                                    value={link} 
                                    onChange={(e) => setLink(e.target.value)}  
                                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-zinc-300">Tipo de contenido</label>
                                <div className="flex flex-wrap gap-3">
                                {opciones.map((opcion) => (
                                    <button
                                        key={opcion}
                                        type="button"
                                        onClick={() => setTipo(opcion)}
                                        className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                            tipo === opcion
                                                ? 'bg-white text-black'
                                                : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                    >
                                        {opcion}
                                    </button>
                                ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="titulo" className="text-sm font-semibold text-zinc-300">Título</label>
                                <input
                                    type="text" 
                                    id="titulo" 
                                    value={titulo} 
                                    onChange={(e) => setTitulo(e.target.value)}  
                                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="año" className="text-xs font-semibold text-gray-400">Año</label>
                                    <select
                                        id="año"
                                        value={año}
                                        onChange={(e) => setAño(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                        <option value="2021">2021</option>
                                        <option value="2020">2020</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="genero" className="text-xs font-semibold text-gray-400">Género</label>
                                    <select
                                        id="genero"
                                        value={genero}
                                        onChange={(e) => setGenero(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                                    >
                                        <option value="terror">Terror</option>
                                        <option value="comedia">Comedia</option>
                                        <option value="romance">Romance</option>
                                        <option value="romcom">Romcom</option>
                                        <option value="accion">Acción</option>
                                        <option value="aventura">Aventura</option>
                                        <option value="policial">Policial</option>
                                        <option value="drama">Drama</option>
                                        <option value="cienciaficcion">Ciencia Ficción</option>
                                        <option value="fantasia">Fantasía</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="duracion" className="text-xs font-semibold text-gray-400">Duración</label>
                                    <select
                                        id="duracion"
                                        value={duracion}
                                        onChange={(e) => setDuracion(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                                    >
                                        <option value="10">10 min</option>
                                        <option value="15">15 min</option>
                                        <option value="20">20 min</option>
                                        <option value="25">25 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">60 min</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="descripcion" className="text-sm font-semibold text-zinc-300">Descripción</label>
                                <input
                                    type="text" 
                                    id="descripcion" 
                                    value={descripcion} 
                                    onChange={(e) => setDescripcion(e.target.value)}  
                                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="busqueda" className="text-sm font-semibold text-zinc-300">Buscar Compañeros de Medios</label>
                                <input
                                    type="text"
                                    id="busqueda"
                                    placeholder="Buscar compañero por @usuario"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                                />
    
                                {busqueda.trim() !== '' && (
                                    <ul className="bg-[#1a1a1a] border border-zinc-800 rounded-md max-h-40 overflow-y-auto mt-1">
                                        {compañeros && compañeros.length > 0 ? (
                                            compañeros.filter((usuario) => 
                                                usuario.nombreUser.toLowerCase().includes(busqueda.toLowerCase())
                                            ).map((usuario, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        setBusqueda(usuario.nombreUser);
                                                    }}
                                                    className="p-2.5 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 border-b border-zinc-900 last:border-none flex justify-between items-center"
                                                >
                                                    <span>{usuario.nombreUser}</span>
                                                    <select 
                                                        className="text-xs bg-zinc-900 text-zinc-300 border border-zinc-700 rounded p-1"
                                                        onClick={(e) => e.stopPropagation()} // Evita que se seleccione el usuario al hacer click en el select
                                                    >
                                                        <option value="direccion">Dirección</option>
                                                        <option value="guion">Guión</option>
                                                        <option value="sonido">Sonido</option>
                                                        <option value="fotografia">Fotografía</option>
                                                    </select>
                                                </li>
                                            ))
                                        ) : (
                                            <p className="p-2.5 text-sm text-zinc-500">Cargando compañeros o sin resultados...</p>
                                        )}
                                    </ul>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="comentario" className="text-sm font-semibold text-zinc-300">Comentario</label>
                                <input
                                    type="text" 
                                    id="comentario" 
                                    value={comentario} 
                                    onChange={(e) => setComentario(e.target.value)}  
                                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                            </div>
                        </div>
        
                        <hr className="border-zinc-800 my-8" />
        
                        <div className="flex justify-between items-center">
                            <button 
                                type="button" 
                                className="text-zinc-400 hover:text-white font-medium text-sm transition-colors" 
                                onClick={handleBack}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="bg-white text-black px-6 py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:bg-zinc-200 transition-colors cursor-pointer" 
                                disabled={cargando}
                            >
                                {cargando ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}