import { useState } from 'react'
import { useSesion } from '../auth/useSesion'
import { estadoPublico, pruebaSinToken, listarProductos, listarUsuarios } from '../api/apiService'
import { formatearFecha } from '../utils'

/**
 * Pagina de evidencia para la presentacion. Muestra el token decodificado y
 * dispara las llamadas que la pauta pide demostrar: una ruta abierta que
 * responde 200, una ruta protegida sin token que responde 401, una ruta de
 * cliente que responde 200 con cualquiera de los dos proveedores, y una ruta
 * de administracion que solo responde 200 con un token de Azure.
 */
export default function Diagnostico() {
  const sesion = useSesion();
  const [token, setToken] = useState(null);
  const [contenido, setContenido] = useState(null);
  const [pruebas, setPruebas] = useState([]);
  const [error, setError] = useState(null);

  const decodificar = (jwt) => {
    const partes = jwt.split('.');
    return JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
  };

  const mostrarToken = async () => {
    try {
      const accessToken = await sesion.obtenerToken();
      setToken(accessToken);
      setContenido(decodificar(accessToken));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const registrar = (nombre, esperado, resultado) => {
    setPruebas((previas) => [...previas, { nombre, esperado, resultado, momento: new Date() }]);
  };

  const probarRutaAbierta = async () => {
    try {
      const { status } = await estadoPublico();
      registrar('GET /productos/estado sin token', '200', String(status));
    } catch (e) {
      registrar('GET /productos/estado sin token', '200', `fallo: ${e.message}`);
    }
  };

  const probarSinToken = async () => {
    try {
      const { status } = await pruebaSinToken();
      registrar('GET /productos sin token', '401', String(status));
    } catch (e) {
      registrar('GET /productos sin token', '401', `fallo: ${e.message}`);
    }
  };

  const probarConToken = async () => {
    try {
      await listarProductos(sesion);
      registrar('GET /productos con token (Admin o Cliente)', '200', '200');
    } catch (e) {
      registrar('GET /productos con token (Admin o Cliente)', '200', e.message);
    }
  };

  const probarRolAdmin = async () => {
    try {
      await listarUsuarios(sesion);
      registrar('GET /usuarios (requiere Admin, solo Azure)', '200 si es Azure, 403 si es Cognito', '200');
    } catch (e) {
      registrar('GET /usuarios (requiere Admin, solo Azure)', '200 si es Azure, 403 si es Cognito', e.message);
    }
  };

  return (
    <section>
      <h1>Diagnostico</h1>
      <p className="descripcion">
        Herramienta de verificacion. Sirve para mostrar en vivo que el token trae
        los claims esperados y que cada ruta responde el codigo correcto, venga
        el token de Azure o de Cognito.
      </p>
      <p className="descripcion">
        Sesion activa: <strong>{sesion.proveedor === 'azure' ? 'Microsoft Entra ID' : 'AWS Cognito'}</strong>
      </p>

      {error && <p className="aviso aviso-error">{error}</p>}

      <div className="botonera">
        <button className="boton" onClick={mostrarToken}>Ver token</button>
        <button className="boton boton-secundario" onClick={probarRutaAbierta}>Ruta abierta</button>
        <button className="boton boton-secundario" onClick={probarSinToken}>Sin token</button>
        <button className="boton boton-secundario" onClick={probarConToken}>Con token</button>
        <button className="boton boton-secundario" onClick={probarRolAdmin}>Ruta de Admin</button>
      </div>

      {contenido && (
        <>
          <h2>Claims del access token</h2>
          <dl className="ficha">
            <div><dt>iss (emisor)</dt><dd className="mono">{contenido.iss}</dd></div>
            <div><dt>aud (audiencia)</dt><dd className="mono">{contenido.aud || 'sin aud'}</dd></div>
            <div><dt>client_id</dt><dd className="mono">{contenido.client_id || 'sin client_id'}</dd></div>
            <div><dt>roles (Azure)</dt><dd className="mono">{(contenido.roles || []).join(', ') || 'sin roles'}</dd></div>
            <div><dt>cognito:groups</dt><dd className="mono">{(contenido['cognito:groups'] || []).join(', ') || 'sin grupos'}</dd></div>
            <div><dt>exp (expira)</dt><dd className="mono">{formatearFecha(contenido.exp * 1000)}</dd></div>
          </dl>

          <h2>Token completo</h2>
          <pre className="bloque">{token}</pre>
        </>
      )}

      {pruebas.length > 0 && (
        <>
          <h2>Pruebas ejecutadas</h2>
          <table className="tabla">
            <thead>
              <tr><th>Llamada</th><th>Esperado</th><th>Obtenido</th></tr>
            </thead>
            <tbody>
              {pruebas.map((prueba, indice) => (
                <tr key={indice}>
                  <td className="mono">{prueba.nombre}</td>
                  <td>{prueba.esperado}</td>
                  <td className="mono">{prueba.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
