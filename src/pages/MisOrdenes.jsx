import { useEffect, useState } from 'react'
import { useSesion } from '../auth/useSesion'
import { misOrdenes } from '../api/apiService'
import { formatearPrecio, formatearFecha } from '../utils'

export default function MisOrdenes() {
  const sesion = useSesion();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    misOrdenes(sesion)
      .then(setOrdenes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) return <p className="aviso">Cargando ordenes...</p>;
  if (error) return <p className="aviso aviso-error">{error}</p>;
  if (ordenes.length === 0) return <p className="aviso">Todavia no tienes ordenes.</p>;

  return (
    <section>
      <h1>Mis ordenes</h1>
      {ordenes.map((orden) => (
        <article key={orden.id} className="pedido">
          <header>
            <strong>Orden #{orden.id}</strong>
            <span className="etiqueta">{orden.estado}</span>
            <span className="fecha">{formatearFecha(orden.fechaCreacion)}</span>
          </header>
          <ul>
            {orden.detalles.map((detalle) => (
              <li key={detalle.id}>
                {detalle.cantidad} x {detalle.nombreProducto}
                <span className="num">{formatearPrecio(detalle.precioUnitario * detalle.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="total">Total: {formatearPrecio(orden.total)}</p>
        </article>
      ))}
    </section>
  )
}
