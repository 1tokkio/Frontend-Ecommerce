import { apiRequest, ENDPOINTS } from '../authConfig';

/**
 * Pide un access token para nuestra API. Primero lo intenta en silencio desde
 * la cache de MSAL y, si hace falta consentimiento o el token vencio, abre el popup.
 */
export async function obtenerToken(msalInstance) {
  const cuenta = msalInstance.getActiveAccount();
  if (!cuenta) {
    throw new Error('No hay una sesion activa');
  }

  try {
    const respuesta = await msalInstance.acquireTokenSilent({ ...apiRequest, account: cuenta });
    return respuesta.accessToken;
  } catch (error) {
    const respuesta = await msalInstance.acquireTokenPopup(apiRequest);
    return respuesta.accessToken;
  }
}

/**
 * Envoltorio unico para todas las llamadas. Adjunta la cabecera Authorization y
 * traduce los codigos que nos interesan a mensajes claros: 401 cuando el token
 * falta o no es valido, 403 cuando es valido pero al usuario le falta el rol.
 */
async function llamar(msalInstance, url, opciones = {}) {
  const token = await obtenerToken(msalInstance);

  const respuesta = await fetch(url, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opciones.headers || {})
    }
  });

  if (respuesta.status === 401) {
    throw new Error('401 - El token no es valido o ya expiro');
  }
  if (respuesta.status === 403) {
    throw new Error('403 - Tu cuenta no tiene el rol necesario para esta operacion');
  }
  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle.mensaje || `Error ${respuesta.status}`);
  }
  if (respuesta.status === 204) {
    return null;
  }
  return respuesta.json();
}

// ms-usuarios
export const obtenerPerfil = (msal) => llamar(msal, `${ENDPOINTS.usuarios}/perfil`);
export const listarUsuarios = (msal) => llamar(msal, ENDPOINTS.usuarios);

// ms-productos
export const listarProductos = (msal) => llamar(msal, ENDPOINTS.productos);

// ms-carrito
export const verCarrito = (msal) => llamar(msal, ENDPOINTS.carrito);
export const agregarAlCarrito = (msal, producto, cantidad) =>
  llamar(msal, `${ENDPOINTS.carrito}/items`, {
    method: 'POST',
    body: JSON.stringify({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      precioUnitario: producto.precio,
      cantidad
    })
  });
export const quitarDelCarrito = (msal, itemId) =>
  llamar(msal, `${ENDPOINTS.carrito}/items/${itemId}`, { method: 'DELETE' });
export const vaciarCarrito = (msal) => llamar(msal, ENDPOINTS.carrito, { method: 'DELETE' });

// ms-ordenes
export const crearOrden = (msal, items) =>
  llamar(msal, ENDPOINTS.ordenes, { method: 'POST', body: JSON.stringify({ items }) });
export const misOrdenes = (msal) => llamar(msal, `${ENDPOINTS.ordenes}/mis-ordenes`);
export const listarTodasLasOrdenes = (msal) => llamar(msal, ENDPOINTS.ordenes);

/** Llamada deliberadamente sin token, para demostrar la ruta abierta del gateway. */
export async function estadoPublico() {
  const respuesta = await fetch(`${ENDPOINTS.productos}/estado`);
  return { status: respuesta.status, cuerpo: await respuesta.json() };
}

/** Llamada deliberadamente sin token a una ruta protegida. Debe devolver 401. */
export async function pruebaSinToken() {
  const respuesta = await fetch(ENDPOINTS.productos);
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch (error) {
    cuerpo = null;
  }
  return { status: respuesta.status, cuerpo };
}
