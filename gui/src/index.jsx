import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap';
import './scss/app.scss';

const root = createRoot(document.body);
root.render(<App />);