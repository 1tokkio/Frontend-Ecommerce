import { Link, useLocation } from 'react-router-dom'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { loginRequest } from '../authConfig'

export default function Navbar() {
  const { instance } = useMsal();
  const ubicacion = useLocation();
  const cuenta = instance.getActiveAccount();
  const roles = cuenta?.idTokenClaims?.roles || [];

  const iniciarSesion = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error('Fallo el inicio de sesion', error);
    });
  };

  const cerrarSesion = () => {
    instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  };

  const enlace = (destino, texto) => (
    <Link to={destino} className={ubicacion.pathname === destino ? 'activo' : ''}>
      {texto}
    </Link>
  );

  return (
    <header className="navbar">
      <div className="navbar-interior">
        <span className="marca">Pedidos360</span>

        <AuthenticatedTemplate>
          <nav className="enlaces">
            {enlace('/', 'Catalogo')}
            {enlace('/carrito', 'Carrito')}
            {enlace('/pedidos', 'Mis pedidos')}
            {enlace('/perfil', 'Perfil')}
            {roles.includes('Admin') && enlace('/administracion', 'Administracion')}
            {enlace('/diagnostico', 'Diagnostico')}
          </nav>
          <div className="sesion">
            <span className="usuario">{cuenta?.name || cuenta?.username}</span>
            <button className="boton boton-secundario" onClick={cerrarSesion}>Cerrar sesion</button>
          </div>
        </AuthenticatedTemplate>

        <UnauthenticatedTemplate>
          <button className="boton" onClick={iniciarSesion}>Iniciar sesion</button>
        </UnauthenticatedTemplate>
      </div>
    </header>
  )
}
