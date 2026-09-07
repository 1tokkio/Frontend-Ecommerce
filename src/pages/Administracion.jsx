import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { listarUsuarios, listarTodosLosPedidos } from '../api/apiService'
import { formatearPrecio } from '../utils'

/** Solo visible con el rol Admin. Consume los dos endpoints restringidos del backend. */
export default function Administracion() {
  const { instance } = useMsal();
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([listarUsuarios(instance), listarTodosLosPedidos(instance)])
      .then(([u, p]) => {
        setUsuarios(u);
        setPedidos(p);
      })
      .catch((e) => setError(e.message));
  }, [instance]);

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

      <h2>Todos los pedidos ({pedidos.length})</h2>
      <table className="tabla">
        <thead>
          <tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th className="num">Total</th></tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>#{pedido.id}</td>
              <td>{pedido.correoUsuario}</td>
              <td>{pedido.estado}</td>
              <td className="num">{formatearPrecio(pedido.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
