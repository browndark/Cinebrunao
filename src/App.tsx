import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Filmes } from "./pages/Filmes";
import { Salas } from "./pages/Salas";
import { Sessoes } from "./pages/Sessoes";
import { Ingressos } from "./pages/Ingressos";
import { Home } from "./pages/Home";
import { Cinemas } from "./pages/Cinemas";
import { Lanches } from "./pages/Lanches";
import { Combos } from "./pages/Combos";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/filmes" element={<Filmes />} />
          <Route path="/salas" element={<Salas />} />
          <Route path="/sessoes" element={<Sessoes />} />
          <Route path="/ingressos" element={<Ingressos />} />
          <Route path="/cinemas" element={<Cinemas />} />
          <Route path="/lanches" element={<Lanches />} />
          <Route path="/combos" element={<Combos />} />
        </Routes>
      </main>
      <Toaster richColors />
    </BrowserRouter>
  );
}

export default App;
