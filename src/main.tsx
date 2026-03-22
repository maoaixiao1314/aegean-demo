import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress TronLink related errors that often occur in iframe environments
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('tronlinkParams')) {
    event.preventDefault();
    console.warn('Suppressed external TronLink error:', event.message);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('tronlinkParams')) {
    event.preventDefault();
    console.warn('Suppressed external TronLink unhandled rejection:', event.reason.message);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
