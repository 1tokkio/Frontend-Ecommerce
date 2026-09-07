import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../authConfig'

export default function Bienvenida() {
  const { instance } = useMsal();

  return (
    <section className="bienvenida">
      <h1>Tienda Pedidos360</h1>
      <p>
        Para ver el catalogo y comprar necesitas iniciar sesion con tu cuenta.
        La autenticacion la resuelve Microsoft Entra ID y el catalogo viaja
        protegido por el API Gateway.
      </p>
      <button className="boton" onClick={() => instance.loginPopup(loginRequest)}>
        Iniciar sesion
      </button>
    </section>
  )
}
