import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Landing() {
    const navigate = useNavigate();

    const handleNavigateInicioSesion = () => {
        navigate('./iniciosesion');
    };

    const handleNavigateRegistro = () => {
        navigate('./registro');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0c0f] text-white font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col items-start justify-center px-8 md:px-24 lg:px-48 py-12 w-full">
                
                <div className="mb-24">
                    <div className="flex items-center font-serif font-bold tracking-tight mb-4">
                        <h1 className="text-6xl md:text-[6rem] leading-none">
                            LinkBox<span className="text-[#ff2a70]">d</span>
                        </h1>
                        <div className="w-3 h-3 md:w-5 md:h-5 bg-[#ff5a5f] rounded-full ml-3 mt-4 self-center"></div>
                    </div>
                    <p className="text-[#8c9baf] text-lg md:text-xl max-w-xl text-left mt-6">
                        Desarrolla tu futuro dentro de tu especialidad y lanza tu carrera.
                    </p>
                </div>

                <div className="flex flex-col items-start w-full">
                    <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-100 text-left">
                        ¿Sos un alumno de Medios que quiere salir adelante?
                    </h2>
                    
                    <span className="text-[#ff2a70] font-bold text-3xl md:text-4xl mb-10">
                        ¡Ingresa!
                    </span>
                    
                    <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                        <button 
                            onClick={handleNavigateRegistro}
                            className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors duration-200 text-center"
                        >
                            Registro
                        </button>
                        <button 
                            onClick={handleNavigateInicioSesion}
                            className="bg-transparent border border-[#445566] text-white px-10 py-3 rounded-full font-bold hover:border-white hover:bg-white/5 transition-colors duration-200 text-center"
                        >
                            Inicio de sesión
                        </button>
                    </div>
                </div>
                
            </main>

            <Footer />
        </div>
    );
}