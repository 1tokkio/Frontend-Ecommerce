import { useMsal } from '@azure/msal-react'
import { useAuth } from 'react-oidc-context'
import {
  loginRequest,
  signOutRedirect,
  PENDING_AUTH_PROVIDER_KEY,
  AUTH_PROVIDER_AZURE,
  AUTH_PROVIDER_COGNITO
} from '../auth/AuthConfig'

/**
 * Los dos botones de inicio de sesion, uno por proveedor. El flujo es por
 * redireccion (loginRedirect / signinRedirect) y no por popup: es mas fiable,
 * evita bloqueos del navegador y popups que no se cierran.
 */
export default function LoginButton() {
  const { instance, accounts } = useMsal();
  const cognito = useAuth();

  const sesionAzure = accounts.length > 0;
  const sesionCognito = cognito.isAuthenticated;

  const iniciarSesionAzure = () => {
    // Se marca el proveedor para que main.jsx sepa que el ?code= que vuelve es de Azure.
    sessionStorage.setItem(PENDING_AUTH_PROVIDER_KEY, AUTH_PROVIDER_AZURE);
    instance.loginRedirect(loginRequest).catch((error) => {
      sessionStorage.removeItem(PENDING_AUTH_PROVIDER_KEY);
      console.error('Error en el inicio de sesion con Azure', error);
    });
  };

  const cerrarSesionAzure = () => {
    instance.logoutRedirect().catch((error) => {
      console.error('Error al cerrar sesion de Azure', error);
    });
  };

  const iniciarSesionCognito = async () => {
    sessionStorage.setItem(PENDING_AUTH_PROVIDER_KEY, AUTH_PROVIDER_COGNITO);
    try {
      await cognito.signinRedirect();
    } catch (error) {
      sessionStorage.removeItem(PENDING_AUTH_PROVIDER_KEY);
      console.error('Error en el inicio de sesion con Cognito', error);
    }
  };

  // Hay que limpiar la sesion local ANTES de navegar al Hosted UI: signOutRedirect
  // solo borra la cookie de Cognito, el usuario que oidc-client-ts guarda en
  // sessionStorage seguiria ahi y la app se leeria como autenticada al volver.
  const cerrarSesionCognito = async () => {
    try {
      await cognito.removeUser();
    } catch (error) {
      console.error('Error al limpiar la sesion local de Cognito', error);
    }
    signOutRedirect();
  };

  if (sesionAzure) {
    return (
      <div className="sesion">
        <span className="usuario">{accounts[0]?.name || accounts[0]?.username} (Microsoft)</span>
        <button className="boton boton-secundario" onClick={cerrarSesionAzure}>Cerrar sesion</button>
      </div>
    );
  }

  if (sesionCognito) {
    const correo = cognito.user?.profile?.email || cognito.user?.profile?.phone_number || 'usuario Cognito';
    return (
      <div className="sesion">
        <span className="usuario">{correo} (AWS)</span>
        <button className="boton boton-secundario" onClick={cerrarSesionCognito}>Cerrar sesion</button>
      </div>
    );
  }

  return (
    <div className="botones-login">
      <button className="boton" onClick={iniciarSesionAzure}>Iniciar sesion con Microsoft</button>
      <button className="boton boton-secundario" onClick={iniciarSesionCognito} disabled={cognito.isLoading}>
        {cognito.isLoading ? 'Iniciando sesion...' : 'Iniciar sesion con AWS'}
      </button>
      {cognito.error && <p className="aviso aviso-error">Error de AWS Cognito: {cognito.error.message}</p>}
    </div>
  );
}
