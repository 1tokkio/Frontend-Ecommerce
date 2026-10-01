import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { AuthProvider } from 'react-oidc-context'
import {
  msalConfig,
  cognitoOidcConfig,
  PENDING_AUTH_PROVIDER_KEY,
  AUTH_PROVIDER_COGNITO
} from './auth/AuthConfig'
import App from './App'
import './styles.css'

const msalInstance = new PublicClientApplication(msalConfig);

// Azure y Cognito regresan por redirect a la misma pagina con ?code=...&state=...
// en el query string. Detecta si la URL actual trae una respuesta de cualquiera
// de los dos para que solo el proveedor que la pidio intente canjear el codigo.
function hayCallbackDeAuth(search = window.location.search) {
  const params = new URLSearchParams(search);
  return Boolean((params.get('code') || params.get('error')) && params.get('state'));
}

// Tras canjear el codigo, los parametros quedan en la barra de direcciones y
// un F5 los reenvia como si fueran parametros normales de la app.
function limpiarUrl() {
  const url = new URL(window.location.href);
  ['code', 'state', 'session_state', 'error', 'error_description', 'error_uri']
    .forEach((param) => url.searchParams.delete(param));
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

async function bootstrap() {
  // MSAL 3 exige inicializar la instancia antes de cualquier interaccion.
  await msalInstance.initialize();

  const proveedorPendiente = sessionStorage.getItem(PENDING_AUTH_PROVIDER_KEY);
  // Si el redirect vino de Cognito, MSAL no debe tocar ese ?code=...&state=...:
  // no encontraria su propia solicitud guardada y podria reportarlo como error.
  // Cada proveedor canjea su propio codigo y solo uno debe hacerlo.
  const callbackDeCognito = proveedorPendiente === AUTH_PROVIDER_COGNITO;
  const callbackDeAzure = hayCallbackDeAuth() && !callbackDeCognito;

  if (callbackDeAzure) {
    try {
      await msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('Error al procesar la respuesta de Azure:', error);
    }
    limpiarUrl();
  } else if (!callbackDeCognito) {
    // Callback de una pestana vieja o de otra pagina: se descarta para que
    // ningun proveedor intente canjear un codigo que no le pertenece.
    limpiarUrl();
  }

  const cuentas = msalInstance.getAllAccounts();
  if (cuentas.length > 0) {
    msalInstance.setActiveAccount(cuentas[0]);
  }
  msalInstance.addEventCallback((evento) => {
    if (evento.eventType === EventType.LOGIN_SUCCESS && evento.payload.account) {
      msalInstance.setActiveAccount(evento.payload.account);
    }
  });

  // El marcador ya fue consumido (o la pagina nunca lanzo redirect).
  sessionStorage.removeItem(PENDING_AUTH_PROVIDER_KEY);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {/* skipSigninCallback evita que react-oidc-context intente canjear el
          ?code= de Azure como si fuera suyo. Con el flag ya limpio, Cognito
          vuelve a leer los parametros que el Hosted UI acaba de dejar. */}
      <AuthProvider
        {...cognitoOidcConfig}
        skipSigninCallback={!callbackDeCognito}
        onSigninCallback={limpiarUrl}
      >
        <MsalProvider instance={msalInstance}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MsalProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

bootstrap();
