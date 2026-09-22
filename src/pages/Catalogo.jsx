import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { listarProductos, agregarAlCarrito } from '../api/apiService'
import { formatearPrecio } from '../utils'

export default function Catalogo() {
  const { instance } = useMsal();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    listarProductos(instance)
      .then(setProductos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [instance]);

  const agregar = async (producto) => {
    try {
      await agregarAlCarrito(instance, producto, 1);
      setMensaje(`${producto.nombre} agregado al carrito`);
      setTimeout(() => setMensaje(null), 2500);
    } catch (e) {
      setError(e.message);
    }
  };

  if (cargando) return <p className="aviso">Cargando catalogo...</p>;
  if (error) return <p className="aviso aviso-error">{error}</p>;

  return (
    <section>
      <h1>Catalogo</h1>
      {mensaje && <p className="aviso aviso-ok">{mensaje}</p>}
      <div className="grilla">
        {productos.map((producto) => (
          <article key={producto.id} className="tarjeta">
            <span className="categoria">{producto.categoria}</span>
            <h2>{producto.nombre}</h2>
            <p className="descripcion">{producto.descripcion}</p>
            <p className="precio">{formatearPrecio(producto.precio)}</p>
            <p className={producto.stock > 0 ? 'stock' : 'stock stock-agotado'}>
              {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
            </p>
            <button className="boton" disabled={producto.stock <= 0} onClick={() => agregar(producto)}>
              Agregar
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
