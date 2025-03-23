/**
 * Telegram WebApp Debug Script
 * This script helps diagnose issues with Telegram Mini Apps integration.
 * Include it in your HTML with <script src="/telegram-debug.js"></script>
 */

(function() {
  // Initialize debug container
  const initDebugger = () => {
    console.log('Telegram WebApp Debugger initializing...');
    
    // Check if we're in debug mode via URL param
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('tgWebAppDebug') === '1';
    
    if (!debugMode) {
      console.log('Debug mode not enabled. Add ?tgWebAppDebug=1 to URL to enable.');
      
      // Still set up the basic error handling
      setupErrorHandling();
      return;
    }
    
    // Create debug container
    const debugContainer = document.createElement('div');
    debugContainer.id = 'tg-webapp-debug';
    debugContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 9999;
      display: none;
    `;
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'TG Debug';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #0088cc;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 12px;
      z-index: 10000;
      opacity: 0.7;
    `;
    
    toggleButton.addEventListener('click', () => {
      if (debugContainer.style.display === 'none') {
        debugContainer.style.display = 'block';
        collectAndDisplayDebugInfo();
      } else {
        debugContainer.style.display = 'none';
      }
    });
    
    document.body.appendChild(debugContainer);
    document.body.appendChild(toggleButton);
    
    // Set up error handling
    setupErrorHandling();
    
    console.log('Telegram WebApp Debugger initialized. Click the TG Debug button to view debug info.');
  };
  
  // Collect and display debug info
  const collectAndDisplayDebugInfo = () => {
    const container = document.getElementById('tg-webapp-debug');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Add heading
    const heading = document.createElement('h4');
    heading.textContent = 'Telegram WebApp Debug Info';
    heading.style.margin = '0 0 10px 0';
    container.appendChild(heading);
    
    // Check Telegram globals
    appendDebugLine(container, 'window.Telegram exists', !!window.Telegram);
    
    if (window.Telegram) {
      appendDebugLine(container, 'window.Telegram.WebApp exists', !!window.Telegram.WebApp);
      
      if (window.Telegram.WebApp) {
        const WebApp = window.Telegram.WebApp;
        appendDebugLine(container, 'WebApp version', WebApp.version || 'unknown');
        appendDebugLine(container, 'Platform', WebApp.platform || 'unknown');
        appendDebugLine(container, 'initData exists', !!WebApp.initData);
        appendDebugLine(container, 'initData length', WebApp.initData ? WebApp.initData.length : 0);
        appendDebugLine(container, 'initDataUnsafe exists', !!WebApp.initDataUnsafe);
        
        if (WebApp.initDataUnsafe) {
          appendDebugLine(container, 'initDataUnsafe keys', Object.keys(WebApp.initDataUnsafe).join(', '));
          
          if (WebApp.initDataUnsafe.user) {
            appendDebugLine(container, 'User ID', WebApp.initDataUnsafe.user.id);
            appendDebugLine(container, 'User name', 
              `${WebApp.initDataUnsafe.user.first_name} ${WebApp.initDataUnsafe.user.last_name || ''}`);
            appendDebugLine(container, 'Username', WebApp.initDataUnsafe.user.username || 'none');
          } else {
            appendDebugLine(container, 'User data', 'Not available');
          }
          
          appendDebugLine(container, 'Start param', WebApp.initDataUnsafe.start_param || 'none');
        }
      }
    }
    
    // Add error log section
    const errorHeading = document.createElement('h4');
    errorHeading.textContent = 'Recent Errors';
    errorHeading.style.margin = '10px 0 5px 0';
    container.appendChild(errorHeading);
    
    const errorList = document.createElement('div');
    errorList.id = 'tg-debug-errors';
    errorList.style.color = '#ff6b6b';
    container.appendChild(errorList);
    
    if (window._tgWebAppErrors && window._tgWebAppErrors.length) {
      window._tgWebAppErrors.forEach(err => {
        const errorItem = document.createElement('div');
        errorItem.textContent = `${err.time}: ${err.message}`;
        errorList.appendChild(errorItem);
      });
    } else {
      const noErrors = document.createElement('div');
      noErrors.textContent = 'No errors recorded';
      errorList.appendChild(noErrors);
    }
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Info';
    refreshButton.style.cssText = `
      background: #0088cc;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 12px;
      margin-top: 10px;
    `;
    refreshButton.addEventListener('click', collectAndDisplayDebugInfo);
    container.appendChild(refreshButton);
  };
  
  // Helper to append debug line
  const appendDebugLine = (container, label, value) => {
    const line = document.createElement('div');
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${label}: `;
    labelSpan.style.color = '#aaa';
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = typeof value === 'boolean' 
      ? (value ? '✓ Yes' : '✗ No') 
      : value;
    valueSpan.style.color = typeof value === 'boolean'
      ? (value ? '#4cd137' : '#ff6b6b')
      : '#fff';
    
    line.appendChild(labelSpan);
    line.appendChild(valueSpan);
    container.appendChild(line);
  };
  
  // Set up error handling
  const setupErrorHandling = () => {
    // Initialize error array
    window._tgWebAppErrors = window._tgWebAppErrors || [];
    
    // Override console.error
    const originalConsoleError = console.error;
    console.error = function() {
      // Call original console.error
      originalConsoleError.apply(console, arguments);
      
      // Log to our error array
      const errorMessage = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      window._tgWebAppErrors.push({
        time: new Date().toLocaleTimeString(),
        message: errorMessage
      });
      
      // Keep only last 10 errors
      if (window._tgWebAppErrors.length > 10) {
        window._tgWebAppErrors.shift();
      }
      
      // Update error display if visible
      const errorList = document.getElementById('tg-debug-errors');
      if (errorList) {
        const errorItem = document.createElement('div');
        errorItem.textContent = `${new Date().toLocaleTimeString()}: ${errorMessage}`;
        errorList.appendChild(errorItem);
      }
    };
    
    // Capture unhandled errors
    window.addEventListener('error', function(event) {
      console.error('Unhandled error:', event.error ? event.error.message : event.message);
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled promise rejection:', event.reason);
    });
  };
  
  // Initialize when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugger);
  } else {
    initDebugger();
  }
})(); 