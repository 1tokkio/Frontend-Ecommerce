import LoginButton from '../components/LoginButton'

export default function Bienvenida() {
  return (
    <section className="bienvenida">
      <h1>Tienda Pedidos360</h1>
      <p>
        Para ver el catalogo y comprar necesitas iniciar sesion. Los administradores
        entran con su cuenta de Microsoft; los clientes se registran e inician
        sesion con su cuenta de AWS.
      </p>
      <LoginButton />
    </section>
  )
}
