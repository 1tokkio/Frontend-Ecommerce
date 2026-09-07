import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './authConfig'
import App from './App'
import './styles.css'

const msalInstance = new PublicClientApplication(msalConfig);

// MSAL 3 exige inicializar antes de usar la instancia.
msalInstance.initialize().then(() => {
  const cuentas = msalInstance.getAllAccounts();
  if (cuentas.length > 0) {
    msalInstance.setActiveAccount(cuentas[0]);
  }

  msalInstance.addEventCallback((evento) => {
    if (evento.eventType === EventType.LOGIN_SUCCESS && evento.payload.account) {
      msalInstance.setActiveAccount(evento.payload.account);
    }
  });

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </React.StrictMode>
  );
});
