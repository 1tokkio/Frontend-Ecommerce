import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMsal } from '@azure/msal-react'
import { verCarrito, quitarDelCarrito, vaciarCarrito, crearOrden } from '../api/apiService'
import { formatearPrecio } from '../utils'

export default function Carrito() {
  const { instance } = useMsal();
  const navegar = useNavigate();
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    verCarrito(instance)
      .then(setCarrito)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [instance]);

  useEffect(cargar, [cargar]);

  const quitar = async (itemId) => {
    try {
      await quitarDelCarrito(instance, itemId);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const confirmar = async () => {
    try {
      const items = carrito.items.map((item) => ({
        productoId: item.productoId,
        nombreProducto: item.nombreProducto,
        precioUnitario: item.precioUnitario,
        cantidad: item.cantidad
      }));
      await crearOrden(instance, items);
      await vaciarCarrito(instance);
      navegar('/ordenes');
    } catch (e) {
      setError(e.message);
    }
  };

  if (cargando) return <p className="aviso">Cargando carrito...</p>;

  return (
    <section>
      <h1>Carrito</h1>
      {error && <p className="aviso aviso-error">{error}</p>}

      {carrito.items.length === 0 ? (
        <p className="aviso">Tu carrito esta vacio.</p>
      ) : (
        <>
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="num">Precio</th>
                <th className="num">Cantidad</th>
                <th className="num">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombreProducto}</td>
                  <td className="num">{formatearPrecio(item.precioUnitario)}</td>
                  <td className="num">{item.cantidad}</td>
                  <td className="num">{formatearPrecio(item.precioUnitario * item.cantidad)}</td>
                  <td className="num">
                    <button className="boton boton-secundario" onClick={() => quitar(item.id)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pie-carrito">
            <span className="total">Total: {formatearPrecio(carrito.total)}</span>
            <button className="boton" onClick={confirmar}>Confirmar orden</button>
          </div>
        </>
      )}
    </section>
  )
}
