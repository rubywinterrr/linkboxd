import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Proximamente() {
  return (
    <div className="min-h-screen bg-fondo text-texto flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto flex-1 px-16 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-slab font-bold text-[34px] text-texto">
          Próximamente
        </h1>
        <p className="font-karla text-sm text-texto-sec">
          perdon polo te queremos
        </p>
        <Link
          to="/"
          className="mt-2 px-4 py-2.5 rounded bg-texto font-karla font-bold text-sm text-fondo hover:opacity-90 transition-opacity"
        >
          Volver al inicio super cool 
        </Link>
      </main>

      <Footer />
    </div>
  );
}
