import { useSesion } from '../auth/useSesion'

/**
 * Guard de rutas. Bloquea el acceso si no hay sesion y, cuando se le indica un
 * rol, comprueba que la sesion lo tenga. Es la misma regla que aplica el
 * backend, replicada en el front para no mostrar pantallas que igual
 * terminarian en un 403.
 *
 * El unico rol que se pide desde el front es "Admin", y ese solo lo entrega
 * Azure: por eso alcanza con comparar contra esAdmin en vez de una lista de roles.
 */
export default function RutaProtegida({ children, rol }) {
  const { autenticado, esAdmin } = useSesion();

  if (!autenticado) {
    return <p className="aviso">Necesitas iniciar sesion para ver esta pagina.</p>;
  }

  if (rol === 'Admin' && !esAdmin) {
    return (
      <div className="aviso aviso-error">
        <h2>Acceso denegado</h2>
        <p>Esta seccion requiere el rol <strong>Admin</strong> y tu cuenta no lo tiene.</p>
      </div>
    );
  }

  return children;
}
