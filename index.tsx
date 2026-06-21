/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App';
import { AuthProvider } from './components/AuthProvider';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const reCaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {reCaptchaSiteKey ? (
      <GoogleReCaptchaProvider reCaptchaKey={reCaptchaSiteKey}>
        <AppErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppErrorBoundary>
      </GoogleReCaptchaProvider>
    ) : (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-lg font-semibold text-white">Missing reCAPTCHA Configuration</h1>
          <p className="text-sm text-slate-400 mt-2">
            Set <code>VITE_RECAPTCHA_SITE_KEY</code> before loading the application.
          </p>
        </div>
      </div>
    )}
  </React.StrictMode>
);
