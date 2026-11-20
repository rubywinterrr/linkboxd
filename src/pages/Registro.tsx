import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useUsuarioContext from '../hooks/useUsuarioContext';
import { apiRequest, toUsuario, type ApiUser } from '../utils/api';

export default function Registro () {
    const [ nombre, setNombre ] = useState<string>('');
    const [ nombreUser, setNombreUser] = useState<string>('');
    const [ apellido, setApellido ] = useState<string>('');
    const [ mail, setMail ] = useState<string>(''); 
    const [ contraseña, setContraseña ] = useState<string>('');
    const [ telefono, setTelefono ] = useState<string>('');
    const [ cargando, setCargando ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    const { registrarse } = useUsuarioContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim() || !nombreUser.trim() || !apellido.trim() || !mail.trim() || !contraseña.trim()) {
            setError('Completá todos los campos obligatorios.');
            return;
        }

        setCargando(true);

        try {
            const data = await apiRequest<{ token: string; user: ApiUser }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    nombre,
                    apellido,
                    nombreUsuario: nombreUser,
                    email: mail,
                    password: contraseña,
                    telefono
                }),
            });

            registrarse(toUsuario(data.user), data.token);

            navigate('/inicio');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    const handleNavigateInicioSesion = () => {
        navigate('/iniciosesion');
    };

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <>
        <Navbar/>
        <div className="w-full bg-[#0a0a0a] text-white flex justify-center py-12 px-6 font-sans min-h-screen">
            <div className="w-full max-w-4xl">
                
                <div className="mb-10">
                    <p className="text-zinc-400 text-sm mb-2">
                        ¿Ya tienes una cuenta? <button type="button" onClick={handleNavigateInicioSesion} className="text-white hover:underline">Inicia sesion aquí.</button>
                    </p>
                    <h1 className="text-3xl font-bold mb-2">Registrate</h1>
                    <p className="text-zinc-400 text-sm">
                        Los usuarios te reconocerán por tu nombre de usuario. No podrán ver tu contraseña.
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
                            <label htmlFor="nombre" className="text-sm font-semibold text-zinc-300">Nombre</label>
                            <input
                                type="text" 
                                id="nombre" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="nombreUser" className="text-sm font-semibold text-zinc-300">Nombre de usuario</label>
                            <input
                                type="text" 
                                id="nombreUser" 
                                value={nombreUser} 
                                onChange={(e) => setNombreUser(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="apellido" className="text-sm font-semibold text-zinc-300">Apellido</label>
                            <input
                                type="text" 
                                id="apellido" 
                                value={apellido} 
                                onChange={(e) => setApellido(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="gmail" className="text-sm font-semibold text-zinc-300">Gmail</label>
                            <input
                                type="email" 
                                id="gmail" 
                                value={mail} 
                                onChange={(e) => setMail(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="contraseña" className="text-sm font-semibold text-zinc-300">Contraseña</label>
                            <input
                                type="password" 
                                id="contraseña" 
                                value={contraseña} 
                                onChange={(e) => setContraseña(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                            <label htmlFor="telefono" className="text-sm font-semibold text-zinc-300">Telefono</label>
                            <input
                                type="telefono" 
                                id="telefono" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)}  
                                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                    </div>

                    <p className="mt-6 text-sm text-zinc-400">
                        El tipo de cuenta se asigna automáticamente según el correo autorizado por la escuela.
                    </p>

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
                            className="bg-white text-black px-6 py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:bg-zinc-200 transition-colors" 
                            disabled={cargando}
                        >
                            {cargando ? 'Creando cuenta...' : 'Registrarme'}
                        </button>
                    </div>
                    
                </form>
            </div>
        </div>
        <Footer />
        </>
    );
}