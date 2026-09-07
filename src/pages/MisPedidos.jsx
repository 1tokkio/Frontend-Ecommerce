import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { misPedidos } from '../api/apiService'
import { formatearPrecio, formatearFecha } from '../utils'

export default function MisPedidos() {
  const { instance } = useMsal();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    misPedidos(instance)
      .then(setPedidos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [instance]);

  if (cargando) return <p className="aviso">Cargando pedidos...</p>;
  if (error) return <p className="aviso aviso-error">{error}</p>;
  if (pedidos.length === 0) return <p className="aviso">Todavia no tienes pedidos.</p>;

  return (
    <section>
      <h1>Mis pedidos</h1>
      {pedidos.map((pedido) => (
        <article key={pedido.id} className="pedido">
          <header>
            <strong>Pedido #{pedido.id}</strong>
            <span className="etiqueta">{pedido.estado}</span>
            <span className="fecha">{formatearFecha(pedido.fechaCreacion)}</span>
          </header>
          <ul>
            {pedido.detalles.map((detalle) => (
              <li key={detalle.id}>
                {detalle.cantidad} x {detalle.nombreProducto}
                <span className="num">{formatearPrecio(detalle.precioUnitario * detalle.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="total">Total: {formatearPrecio(pedido.total)}</p>
        </article>
      ))}
    </section>
  )
}
