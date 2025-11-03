import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{ redirect_uri: window.location.origin }}
    cacheLocation='localstorage'
    useRefreshTokens={true}
  >
    <App />
  </Auth0Provider>
);

if (import.meta.env.PROD) {
  const init = async () => {
    const Sentry = await import('@sentry/react');

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV || 'production',
      release: import.meta.env.VITE_COMMIT_SHA,

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.05,
      tracePropagationTargets: [/^https?:\/\/localhost(:\d+)?\/api/],

      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
  

      sendDefaultPii: false, 
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 0);
  }
}
