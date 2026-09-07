import { useMsal } from '@azure/msal-react'

/**
 * Guard de rutas. Bloquea el acceso si no hay sesion y, cuando se le indica un rol,
 * comprueba que ese rol venga en el claim "roles" del token. Es la misma regla que
 * aplica el backend, replicada en el front para no mostrar pantallas que igual
 * terminarian en un 403.
 */
export default function RutaProtegida({ children, rol }) {
  const { instance } = useMsal();
  const cuenta = instance.getActiveAccount();

  if (!cuenta) {
    return <p className="aviso">Necesitas iniciar sesion para ver esta pagina.</p>;
  }

  if (rol) {
    const roles = cuenta.idTokenClaims?.roles || [];
    if (!roles.includes(rol)) {
      return (
        <div className="aviso aviso-error">
          <h2>Acceso denegado</h2>
          <p>Esta seccion requiere el rol <strong>{rol}</strong> y tu cuenta no lo tiene.</p>
        </div>
      );
    }
  }

  return children;
}
