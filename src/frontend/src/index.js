import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './scss/index.scss';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
