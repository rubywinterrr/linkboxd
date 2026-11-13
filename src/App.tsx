import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Cuenta from "./pages/Cuenta";
import InicioSesion from "./pages/inicioSesion"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/iniciosesion" element={<InicioSesion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
