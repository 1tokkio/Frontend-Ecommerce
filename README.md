# pedidos360-frontend

Single Page Application de Pedidos360, construida con React 18, Vite, MSAL y
react-oidc-context. Se autentica contra **dos** proveedores de identidad y
consume los seis microservicios a traves del API Gateway `pedidos360-api`. La
propia SPA se sirve por nginx desde una instancia EC2, detras del API Gateway
`pedidos360-web`.

## Flujo de autenticacion

Dos proveedores OIDC conviven en la misma app:

- **Microsoft Entra ID**, para administradores. MSAL Browser implementa
  Authorization Code con PKCE, el flujo que corresponde a una SPA.
- **AWS Cognito**, para clientes, via `react-oidc-context` (que usa
  `oidc-client-ts` por debajo). Mismo flujo: Authorization Code con PKCE,
  contra el Hosted UI del user pool.

El token para llamar a la API sale de MSAL si la sesion es de Azure, o del
`user` de `react-oidc-context` si es de Cognito. Ese detalle lo resuelve
`src/auth/useSesion.js`, para que el resto de la app no tenga que saber de
donde vino la sesion.

**El problema del doble callback.** Azure y Cognito vuelven a la misma URL con
`?code=...&state=...`. Si los dos intentan canjear ese codigo, uno se apropia
del que pertenece al otro y el login falla sin explicacion. La solucion, en
`src/main.jsx`:

- Antes de lanzar el redirect (`src/components/LoginButton.jsx`), se guarda en
  `sessionStorage` quien lo inicio.
- Al volver, solo ese proveedor procesa la respuesta: MSAL llama a
  `handleRedirectPromise()` unicamente si el callback era suyo, y al
  `AuthProvider` de `react-oidc-context` se le pasa `skipSigninCallback`
  cuando no lo era.
- Despues de canjear se limpian de la URL `code`, `state`, `session_state`,
  `error`, `error_description` y `error_uri`, para que un F5 no los reenvie.

Solo Azure entrega el rol `Admin` (via el claim `roles`); un usuario de
Cognito siempre es `Cliente` (el `default-role` que aplica el backend cuando
el access token no trae ningun rol). Por eso la vista de administracion se
oculta si la sesion activa es de Cognito.

## Paginas

| Ruta               | Que hace                                                        |
|---------------------|-------------------------------------------------------------------|
| `/`                | Catalogo de productos, con el stock de cada uno.                |
| `/carrito`         | Carrito del usuario y confirmacion de la orden.                 |
| `/ordenes`         | Historial de ordenes propias.                                   |
| `/perfil`          | Datos del usuario guardados por ms-usuarios.                    |
| `/administracion`  | Usuarios y ordenes de todos. **Solo con sesion de Azure.**       |
| `/diagnostico`     | Token decodificado y pruebas de 200, 401 y 403.                 |

La pagina de diagnostico existe para la defensa del proyecto: muestra `iss`,
`aud`, `client_id`, `roles` y `cognito:groups` del token activo, y permite
disparar en vivo una llamada a una ruta abierta, una a una ruta protegida sin
token, una de cliente y una de administracion.

## Variables de entorno

Vite reemplaza las variables `VITE_` **en tiempo de compilacion**, no en tiempo
de ejecucion. Por eso el Dockerfile las recibe como `ARG` y hay que reconstruir
la imagen si cambia alguna.

    cp .env.example .env
    # completar los valores

## Como levantarlo

    npm install
    npm run dev

Queda en http://localhost:5173, que tiene que estar registrado como redirect
URI de tipo SPA tanto en el registro de la aplicacion de Entra ID como en el
cliente de la app del user pool de Cognito.

Para generar la imagen que se despliega en la instancia de frontend:

    docker build -t pedidos360-frontend \
      --build-arg VITE_AZURE_CLIENT_ID=... \
      --build-arg VITE_AZURE_TENANT_ID=... \
      --build-arg VITE_AZURE_AUTHORITY=... \
      --build-arg VITE_AZURE_SCOPE=... \
      --build-arg VITE_COGNITO_ISSUER_URI=... \
      --build-arg VITE_COGNITO_CLIENT_ID=... \
      --build-arg VITE_COGNITO_SCOPE=... \
      --build-arg VITE_COGNITO_HOSTED_UI=... \
      --build-arg VITE_COGNITO_REDIRECT_URI=... \
      --build-arg VITE_COGNITO_LOGOUT_URI=... \
      --build-arg VITE_MS_USUARIOS_URL=... \
      --build-arg VITE_MS_PRODUCTOS_URL=... \
      --build-arg VITE_MS_CARRITO_URL=... \
      --build-arg VITE_MS_ORDENES_URL=... \
      .

La imagen sirve el build con nginx en el puerto 80, detras del API Gateway
`pedidos360-web`.
