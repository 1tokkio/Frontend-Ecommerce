// ---------------------------------------------------------------------------
// AZURE ENTRA ID — administradores
// ---------------------------------------------------------------------------

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const authority = import.meta.env.VITE_AZURE_AUTHORITY;
const scopeApi = import.meta.env.VITE_AZURE_SCOPE;

export const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Permisos que se piden al iniciar sesion.
export const loginRequest = {
  scopes: ['openid', 'profile']
};

// Permiso que se pide para llamar a nuestros microservicios.
// Este es el scope que el API Gateway y Spring Security verifican en el token.
export const apiRequest = {
  scopes: [scopeApi]
};

// ---------------------------------------------------------------------------
// AWS COGNITO — clientes
// ---------------------------------------------------------------------------

export const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_ISSUER_URI,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI || window.location.origin,
  response_type: 'code',
  scope: import.meta.env.VITE_COGNITO_SCOPE || 'phone openid email'
};

// Dominio del Hosted UI del user pool, adonde Cognito manda al usuario a loguearse.
export const cognitoDomain = import.meta.env.VITE_COGNITO_HOSTED_UI;

// A donde regresa el usuario tras cerrar sesion. Debe estar en las "URL de
// salida de sesion permitidas" del cliente de la app en Cognito.
export const cognitoLogoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI || window.location.origin;

// Cierre de sesion en el Hosted UI de Cognito: ademas de borrar la sesion del
// navegador, invalida la sesion en Cognito. Es el equivalente al logoutRedirect
// de MSAL, por eso no hace falta ninguna libreria para disparar la salida.
export const signOutRedirect = () => {
  const clientIdCognito = import.meta.env.VITE_COGNITO_CLIENT_ID;
  window.location.href =
    `${cognitoDomain}/logout?client_id=${clientIdCognito}&logout_uri=${encodeURIComponent(cognitoLogoutUri)}`;
};

// Ajustes que consume el <AuthProvider> de react-oidc-context.
// response_type "code" + PKCE: Cognito no admite el flujo implicito.
export const cognitoOidcConfig = {
  ...cognitoAuthConfig,
  post_logout_redirect_uri: cognitoLogoutUri,
  loadUserInfo: false,      // el ID token ya trae email/phone, no hace falta /userInfo
  monitorSession: false,    // el token se renueva a mano, no con iframes silenciosos
  automaticSilentRenew: false
};

// ---------------------------------------------------------------------------
// Microservicios
// ---------------------------------------------------------------------------

export const ENDPOINTS = {
  usuarios: import.meta.env.VITE_MS_USUARIOS_URL,
  productos: import.meta.env.VITE_MS_PRODUCTOS_URL,
  carrito: import.meta.env.VITE_MS_CARRITO_URL,
  ordenes: import.meta.env.VITE_MS_ORDENES_URL
};

// ---------------------------------------------------------------------------
// Sincronizacion entre Azure y Cognito
// ---------------------------------------------------------------------------
// Los dos proveedores regresan por redirect a la MISMA pagina con un
// ?code=...&state=... en el query string. Si los dos lo leen, uno se apropia
// del codigo del otro y el login falla. Por eso se marca en sessionStorage
// quien inicio el redirect y en main.jsx solo ese proveedor procesa la respuesta.
export const PENDING_AUTH_PROVIDER_KEY = 'pending_auth_provider';
export const AUTH_PROVIDER_AZURE = 'azure';
export const AUTH_PROVIDER_COGNITO = 'cognito';
