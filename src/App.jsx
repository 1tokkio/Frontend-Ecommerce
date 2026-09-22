import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import Bienvenida from './pages/Bienvenida'
import Catalogo from './pages/Catalogo'
import Carrito from './pages/Carrito'
import MisOrdenes from './pages/MisOrdenes'
import Perfil from './pages/Perfil'
import Administracion from './pages/Administracion'
import Diagnostico from './pages/Diagnostico'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <UnauthenticatedTemplate>
          <Bienvenida />
        </UnauthenticatedTemplate>

        <AuthenticatedTemplate>
          <Routes>
            <Route path="/" element={<Catalogo />} />
            <Route path="/carrito" element={<RutaProtegida><Carrito /></RutaProtegida>} />
            <Route path="/ordenes" element={<RutaProtegida><MisOrdenes /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
            <Route path="/administracion" element={<RutaProtegida rol="Admin"><Administracion /></RutaProtegida>} />
            <Route path="/diagnostico" element={<RutaProtegida><Diagnostico /></RutaProtegida>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthenticatedTemplate>
      </main>
    </>
  )
}
