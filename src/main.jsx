import { GoogleOAuthProvider } from '@react-oauth/google';
//import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <GoogleOAuthProvider
        clientId="937992137479-bmieq5b5nt857c9244urt1lvtr479d9c.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
    </React.StrictMode>
  )


