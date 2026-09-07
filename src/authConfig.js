// Configuracion de MSAL. Todos los valores vienen del .env para no dejar
// identificadores del tenant escritos en el codigo.

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

export const ENDPOINTS = {
  usuarios: import.meta.env.VITE_MS_USUARIOS_URL,
  carrito: import.meta.env.VITE_MS_CARRITO_URL,
  pedidos: import.meta.env.VITE_MS_PEDIDOS_URL
};
