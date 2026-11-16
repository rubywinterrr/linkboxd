import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Cuenta from "./pages/Cuenta";
import InicioSesion from "./pages/inicioSesion"
import Registro from './pages/Registro'
import Publicar from './pages/Publicar'
import Proyecto from "./pages/Proyecto";
import PerfilAlumno from "./pages/PerfilAlumno";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/iniciosesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/proyecto" element={<Proyecto />} />
        <Route path="/perfil" element={<PerfilAlumno />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
