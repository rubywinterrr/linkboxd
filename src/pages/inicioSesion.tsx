import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { UsuarioContext } from '../context/UsuarioContext';

export default function InicioSesionPaciente () {
    const [ nombreUser, setNombreUser] = useState<string>('');
    const [ contraseña, setContraseña ] = useState<string>('');
    const [ rol, setRol ] = useState<string>('Alumno de medios');
    const [ cargando, setCargando ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    const context = useContext(UsuarioContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombreUser.trim() || !contraseña.trim()) {
            alert('Por favor, llenar todos sus datos.');
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('maxiwearewaiting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreUser,
                    password: contraseña,
                    rol
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            const userId = data.user?.id ?? data.user?.id_usuario ?? data.user?.usuario_id;
            if (userId === undefined || userId === null || userId === '') {
                throw new Error('El servidor no devolvió el ID del usuario');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userId', String(userId));

            if (context) {
                context.iniciarSesion(data.user)
            }

            navigate('/');

        } catch (err: unknown) {
            console.error('Error en login:', err);
            setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    const handleNavigateRegistro = () => {
        navigate('/registro');
    };

    const handleBack = () => {
        navigate(-1);
    }

    const handlePrincipal = () => {
        navigate ('/');
    }

    return (
        <>
        <Navbar/>
        <div className="w-full bg-[#0a0a0a] text-white flex justify-center py-12 px-6 font-sans min-h-screen">
            <div className="w-full max-w-4xl">
                
                <div className="mb-10">
                    <p className="text-zinc-400 text-sm mb-2">
                        ¿No tienes una cuenta? <button type="button" onClick={handleNavigateRegistro} className="text-white hover:underline">Registrate aquí.</button>
                    </p>
                    <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
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

                    <div className="mt-12 pt-6">
                        <div className="mb-3 text-sm font-semibold text-zinc-300">Rol</div>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                type="button" 
                                onClick={() => setRol('Alumno de medios')}
                                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                    rol === 'Alumno de medios' 
                                    ? 'bg-white text-black' 
                                    : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                }`}
                            >
                                Alumno de medios
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setRol('Outsider')}
                                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                    rol === 'Outsider' 
                                    ? 'bg-white text-black' 
                                    : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                }`}
                            >
                                Outsider
                            </button>
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
                            className="bg-white text-black px-6 py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:bg-zinc-200 transition-colors" 
                            disabled={cargando}
                            onClick={handlePrincipal}
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