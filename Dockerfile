FROM node:20-alpine AS build
WORKDIR /app

# Vite reemplaza las variables VITE_ en tiempo de compilacion,
# por eso entran como build args y no como variables del contenedor.
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
ARG VITE_AZURE_AUTHORITY
ARG VITE_AZURE_SCOPE
ARG VITE_COGNITO_ISSUER_URI
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_SCOPE
ARG VITE_COGNITO_HOSTED_UI
ARG VITE_COGNITO_REDIRECT_URI
ARG VITE_COGNITO_LOGOUT_URI
ARG VITE_MS_USUARIOS_URL
ARG VITE_MS_PRODUCTOS_URL
ARG VITE_MS_CARRITO_URL
ARG VITE_MS_ORDENES_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
