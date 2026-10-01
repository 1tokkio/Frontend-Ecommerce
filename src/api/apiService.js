import { ENDPOINTS } from '../auth/AuthConfig';

/**
 * Envoltorio unico para todas las llamadas. Recibe la "sesion" que entrega
 * useSesion() (Azure o Cognito, no le importa cual) y le pide el token.
 * Un 401 siempre es token ausente o vencido. Un 403 no necesariamente es falta
 * de rol: puede ser CORS u otra cosa, asi que se muestra el cuerpo real de la
 * respuesta en vez de asumir la causa.
 */
async function llamar(sesion, url, opciones = {}) {
  const token = await sesion.obtenerToken();

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
  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(`${respuesta.status} - ${detalle.mensaje || respuesta.statusText || 'Error'}`);
  }
  if (respuesta.status === 204) {
    return null;
  }
  return respuesta.json();
}

// ms-usuarios
export const obtenerPerfil = (sesion) => llamar(sesion, `${ENDPOINTS.usuarios}/perfil`);
export const listarUsuarios = (sesion) => llamar(sesion, ENDPOINTS.usuarios);

// ms-productos
export const listarProductos = (sesion) => llamar(sesion, ENDPOINTS.productos);

// ms-carrito
export const verCarrito = (sesion) => llamar(sesion, ENDPOINTS.carrito);
export const agregarAlCarrito = (sesion, producto, cantidad) =>
  llamar(sesion, `${ENDPOINTS.carrito}/items`, {
    method: 'POST',
    body: JSON.stringify({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      precioUnitario: producto.precio,
      cantidad
    })
  });
export const quitarDelCarrito = (sesion, itemId) =>
  llamar(sesion, `${ENDPOINTS.carrito}/items?id=${itemId}`, { method: 'DELETE' });
export const vaciarCarrito = (sesion) => llamar(sesion, ENDPOINTS.carrito, { method: 'DELETE' });

// ms-ordenes
export const crearOrden = (sesion, items) =>
  llamar(sesion, ENDPOINTS.ordenes, { method: 'POST', body: JSON.stringify({ items }) });
export const misOrdenes = (sesion) => llamar(sesion, `${ENDPOINTS.ordenes}/mis-ordenes`);
export const listarTodasLasOrdenes = (sesion) => llamar(sesion, ENDPOINTS.ordenes);

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
