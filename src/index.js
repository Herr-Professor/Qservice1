import React from 'react';
import { createRoot } from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import App from './App';
import './styles/global.css';

// Setup global error handling
const setupGlobalErrorHandling = () => {
  console.log("Setting up global error handlers");
  
  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    console.log('Stack:', event.reason?.stack);
    
    // Log additional context if available
    if (event.reason?.response) {
      console.log('Response status:', event.reason.response.status);
      console.log('Response data:', event.reason.response.data);
    }
  });
  
  // Log uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught Error:', event.error);
    console.log('Error Message:', event.message);
    console.log('Stack:', event.error?.stack);
  });
  
  // Log initialization status
  console.log("Application environment:", process.env.NODE_ENV);
  console.log("Window Telegram object exists:", !!window.Telegram);
  
  if (window.Telegram) {
    console.log("Telegram WebApp exists:", !!window.Telegram.WebApp);
    if (window.Telegram.WebApp) {
      console.log("WebApp initialized with version:", window.Telegram.WebApp.version);
      console.log("WebApp platform:", window.Telegram.WebApp.platform);
    }
  }
};

// Initialize Telegram WebApp
try {
  console.log("Attempting to initialize Telegram WebApp...");
  
  // Try to handle errors during WebApp initialization
  if (WebApp) {
    console.log("WebApp SDK loaded successfully");
    WebApp.ready();
    console.log("WebApp.ready() called");
    WebApp.expand();
    console.log("WebApp.expand() called");
  } else {
    console.warn("WebApp SDK not loaded properly");
  }
} catch (error) {
  console.error("Error initializing Telegram WebApp:", error);
}

// Setup global error handling before rendering
setupGlobalErrorHandling();

// Create a function to safely render the app
const renderApp = () => {
  try {
    const container = document.getElementById('root');
    if (!container) {
      console.error("Root container not found in the DOM");
      return;
    }
    
    const root = createRoot(container);
    root.render(<App />);
    console.log("App successfully rendered");
  } catch (error) {
    console.error("Error rendering app:", error);
    
    // Show a basic error message if app fails to render
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: red;">
          <h2>Failed to initialize application</h2>
          <p>Please try refreshing the page or contact support.</p>
          <pre style="text-align: left; margin-top: 20px; font-size: 12px; background: #f5f5f5; padding: 10px; overflow: auto;">
            ${error.message || 'Unknown error'}
          </pre>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0088cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
};

// Render the app
renderApp();
