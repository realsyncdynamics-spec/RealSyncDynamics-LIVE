import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * PRODUCTION NOTE:
 * To enable performance monitoring and error tracking:
 * 1. Install @sentry/react
 * 2. Initialize Sentry here:
 * Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
 */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
