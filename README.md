# pedidos360-frontend

Single Page Application de Pedidos360, construida con React 18, Vite y MSAL.
Se autentica contra Microsoft Entra ID y consume los seis microservicios a traves
del API Gateway `pedidos360-api`. La propia SPA se sirve por nginx desde una
instancia EC2, detras del API Gateway `pedidos360-web`.

## Flujo de autenticacion

MSAL Browser implementa **Authorization Code con PKCE**, que es el flujo que
corresponde a una SPA. No hay que configurarlo: al declarar la aplicacion como
`Single-page application` en Entra ID, MSAL genera el `code_verifier` y el
`code_challenge`, y valida `state` y `nonce` en la respuesta.

El token se pide en dos momentos distintos:

- Al iniciar sesion se piden los permisos basicos (`openid`, `profile`), que
  producen el ID token con el nombre y el correo del usuario.
- Al llamar a la API se pide el scope de nuestra propia API con
  `acquireTokenSilent`. Ese es el access token que viaja en la cabecera
  `Authorization: Bearer` y el que validan el API Gateway y Spring Security.

## Paginas

| Ruta               | Que hace                                                        |
|---------------------|-------------------------------------------------------------------|
| `/`                | Catalogo de productos, con el stock de cada uno.                |
| `/carrito`         | Carrito del usuario y confirmacion de la orden.                 |
| `/ordenes`         | Historial de ordenes propias.                                   |
| `/perfil`          | Datos del usuario guardados por ms-usuarios.                    |
| `/administracion`  | Usuarios y ordenes de todos. **Solo con el rol Admin.**         |
| `/diagnostico`     | Token decodificado y pruebas de 200, 401 y 403.                 |

La pagina de diagnostico existe para la defensa del proyecto: muestra `iss`,
`aud`, `scp`, `roles` y `exp` del token, y permite disparar en vivo una llamada
a una ruta abierta, una a una ruta protegida sin token y una a una ruta que
exige rol.

## Variables de entorno

Vite reemplaza las variables `VITE_` **en tiempo de compilacion**, no en tiempo
de ejecucion. Por eso el Dockerfile las recibe como `ARG` y hay que reconstruir
la imagen si cambia alguna.

    cp .env.example .env
    # completar los valores

## Como levantarlo

    npm install
    npm run dev

Queda en http://localhost:5173, que tiene que estar registrado como redirect URI
de tipo SPA en el registro de la aplicacion de Entra ID.

Para generar la imagen que se despliega en la instancia de frontend:

    docker build -t pedidos360-frontend \
      --build-arg VITE_AZURE_CLIENT_ID=... \
      --build-arg VITE_AZURE_TENANT_ID=... \
      --build-arg VITE_AZURE_AUTHORITY=... \
      --build-arg VITE_AZURE_SCOPE=... \
      --build-arg VITE_MS_USUARIOS_URL=... \
      --build-arg VITE_MS_PRODUCTOS_URL=... \
      --build-arg VITE_MS_CARRITO_URL=... \
      --build-arg VITE_MS_ORDENES_URL=... \
      .

La imagen sirve el build con nginx en el puerto 80, detras del API Gateway
`pedidos360-web`.
