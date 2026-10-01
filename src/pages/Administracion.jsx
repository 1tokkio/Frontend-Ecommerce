import { useEffect, useState } from 'react'
import { useSesion } from '../auth/useSesion'
import { listarUsuarios, listarTodasLasOrdenes } from '../api/apiService'
import { formatearPrecio } from '../utils'

/** Solo visible con el rol Admin. Consume los dos endpoints restringidos del backend. */
export default function Administracion() {
  const sesion = useSesion();
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([listarUsuarios(sesion), listarTodasLasOrdenes(sesion)])
      .then(([u, o]) => {
        setUsuarios(u);
        setOrdenes(o);
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="aviso aviso-error">{error}</p>;

  return (
    <section>
      <h1>Administracion</h1>

      <h2>Usuarios registrados ({usuarios.length})</h2>
      <table className="tabla">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.correo}</td>
              <td>{usuario.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Todas las ordenes ({ordenes.length})</h2>
      <table className="tabla">
        <thead>
          <tr><th>Orden</th><th>Cliente</th><th>Estado</th><th className="num">Total</th></tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>#{orden.id}</td>
              <td>{orden.correoUsuario}</td>
              <td>{orden.estado}</td>
              <td className="num">{formatearPrecio(orden.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
