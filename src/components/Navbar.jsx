import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../auth/useSesion'
import LoginButton from './LoginButton'

export default function Navbar() {
  const ubicacion = useLocation();
  const { autenticado, esAdmin } = useSesion();

  const enlace = (destino, texto) => (
    <Link to={destino} className={ubicacion.pathname === destino ? 'activo' : ''}>
      {texto}
    </Link>
  );

  return (
    <header className="navbar">
      <div className="navbar-interior">
        <span className="marca">Pedidos360</span>

        {autenticado ? (
          <>
            <nav className="enlaces">
              {enlace('/', 'Catalogo')}
              {enlace('/carrito', 'Carrito')}
              {enlace('/ordenes', 'Mis ordenes')}
              {enlace('/perfil', 'Perfil')}
              {esAdmin && enlace('/administracion', 'Administracion')}
              {enlace('/diagnostico', 'Diagnostico')}
            </nav>
            <LoginButton />
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  )
}
