import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InicioSesionPaciente () {
    const [ nombre, setNombre ] = useState<string>('');
    const [ nombreUser, setNombreUser] = useState<string>('');
    const [ apellido, setApellido ] = useState<string>('');
    const [ mail, setMail ] = useState<string>(''); 
    const [ contraseña, setContraseña ] = useState<string>('');
    const [ cargando, setCargando ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim() || !apellido.trim() || !mail.trim() || !contraseña.trim()) {
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
                    nombre,
                    apellido,
                    email: mail,
                    password: contraseña,
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

            navigate('/');

        } catch (err: unknown) {
            console.error('Error en login paciente:', err);
            setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    const handleNavigateRegistro = () => {
        navigate('/registro');
    };

    return (
        <div>
            <form className='DatosInicio' onSubmit={handleSubmit}>
                
                <p className="texto-registro">
                    ¿No tienes una cuenta? <span className="link-registro" onClick={handleNavigateRegistro}>REGISTRATE</span>
                </p>

                {error && (
                    <p style={{}}>
                    </p>
                )}

                <input 
                    type="text" 
                    className='input-campo' 
                    id='nombre' 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    required 
                    placeholder='Tu nombre'
                />

                <input 
                    type="text" 
                    className='input-campo' 
                    id='apellido' 
                    value={apellido} 
                    onChange={(e) => setApellido(e.target.value)} 
                    required 
                    placeholder='Tu apellido'
                />

                <input 
                    type="email" 
                    className='input-campo' 
                    id='email' 
                    value={mail} 
                    onChange={(e) => setMail(e.target.value)} 
                    required 
                    placeholder='Tu email'
                />
                
                <input 
                    type="password" 
                    className='input-campo' 
                    id='contraseña' 
                    value={contraseña} 
                    onChange={(e) => setContraseña(e.target.value)} 
                    required 
                    placeholder='Tu contraseña'
                />
                
                <button type="submit" className="btn-submit" disabled={cargando}>
                    <img src={publicar} alt="Confirmar" className="img-confirmar-login" />
                </button>
                
            </form>
        </div>
    );
}