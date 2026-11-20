import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Cuenta from "./pages/Cuenta";
import InicioSesion from "./pages/inicioSesion"
import Registro from './pages/Registro'
import Publicar from './pages/Publicar'
import Proyecto from "./pages/Proyecto";
import PerfilAlumno from "./pages/PerfilAlumno";
import Proximamente from "./pages/Proximamente";
import Landing from './pages/landing'
import { UsuarioProvider } from "./context/UsuarioProvider";

function App() {
  return (
    <UsuarioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/iniciosesion" element={<InicioSesion />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/proyecto" element={<Proyecto />} />
          <Route path="/proyecto/:projectId" element={<Proyecto />} />
          <Route path="/perfil" element={<PerfilAlumno />} />
          <Route path="/perfil/:userId" element={<PerfilAlumno />} />
          <Route path="*" element={<Proximamente />} />
        </Routes>
      </BrowserRouter>
    </UsuarioProvider>
  );
}

export default App;
