import { useMsal } from '@azure/msal-react'
import { useAuth } from 'react-oidc-context'
import { apiRequest } from './AuthConfig'

/**
 * Un solo punto donde el resto de la app pregunta "hay sesion" y "dame un token",
 * sin que cada pagina tenga que saber si el usuario entro por Azure o por Cognito.
 * Solo Azure entrega el rol Admin: Cognito siempre es Cliente (default-role del
 * backend), asi que "esAdmin" alcanza con mirar si la sesion activa es de Azure.
 */
export function useSesion() {
  const { instance, accounts } = useMsal();
  const cognito = useAuth();

  const sesionAzure = accounts.length > 0;
  const sesionCognito = cognito.isAuthenticated;

  const nombre = sesionAzure
    ? (accounts[0]?.name || accounts[0]?.username)
    : (cognito.user?.profile?.email || cognito.user?.profile?.phone_number || 'usuario Cognito');

  // Respaldo para ms-ordenes: el access token de Cognito no lleva el claim email.
  const correo = sesionAzure ? accounts[0]?.username : cognito.user?.profile?.email;

  const obtenerToken = async () => {
    if (sesionAzure) {
      const respuesta = await instance.acquireTokenSilent({ ...apiRequest, account: accounts[0] });
      return respuesta.accessToken;
    }
    if (sesionCognito) {
      if (!cognito.user) {
        throw new Error('No hay una sesion activa');
      }
      if (!cognito.user.expired) {
        return cognito.user.access_token;
      }
      const renovado = await cognito.signinSilent();
      if (!renovado) {
        throw new Error('No se pudo renovar la sesion de Cognito');
      }
      return renovado.access_token;
    }
    throw new Error('No hay una sesion activa');
  };

  return {
    autenticado: sesionAzure || sesionCognito,
    proveedor: sesionAzure ? 'azure' : (sesionCognito ? 'cognito' : null),
    esAdmin: sesionAzure,
    nombre,
    correo,
    obtenerToken
  };
}
