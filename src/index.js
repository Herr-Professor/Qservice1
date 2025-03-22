import React from 'react';
import { createRoot } from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import App from './App';
import './styles/global.css';

// Initialize Telegram WebApp
WebApp.ready();
WebApp.expand();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
