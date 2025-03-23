import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './App.css';

// Pages
import GamePage from './pages/GamePage';
import EscrowPage from './pages/EscrowPage';
import ShopPage from './pages/ShopPage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import TelegramDebugPage from './pages/TelegramDebugPage';

// Context
import { AppContextProvider, AppContext, useAppContext } from './context/AppContext';

// Import BottomNavBar
import BottomNavBar from './components/BottomNavBar';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import TelegramLoginButton from './components/TelegramLoginButton';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const { loading, error, user } = useAppContext();

  useEffect(() => {
    try {
      // Set theme colors based on Telegram WebApp theme
      if (WebApp && WebApp.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', WebApp.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', WebApp.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', WebApp.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', WebApp.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', WebApp.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', WebApp.themeParams.button_text_color);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', WebApp.themeParams.secondary_bg_color);

        // Back button handling
        if (WebApp.BackButton) {
          WebApp.BackButton.onClick(() => {
            window.history.back();
          });
        }

        // Update Telegram WebApp header based on current path
        updateHeader();
      } else {
        console.warn("WebApp or WebApp.themeParams not available, using default styles");
      }
    } catch (error) {
      console.error("Error setting up Telegram theme:", error);
    }
  }, []);

  const updateHeader = () => {
    try {
      if (!WebApp || !WebApp.BackButton) {
        console.warn("WebApp.BackButton not available");
        return;
      }
      
      const path = window.location.pathname;
      
      // Show BackButton if not on home page
      if (path !== '/') {
        WebApp.BackButton.show();
      } else {
        WebApp.BackButton.hide();
      }
    } catch (error) {
      console.error("Error updating header:", error);
    }
  };

  // Show loading screen while initializing
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an error
  if (error) {
    return <ErrorScreen message={error} />;
  }

  // If no user is logged in yet, show login button
  if (!user) {
    return <TelegramLoginButton />;
  }

  // Main application UI
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <Routes>
            <Route path="/" element={<Navigate to="/game" replace />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/escrow" element={<EscrowPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/debug" element={<TelegramDebugPage />} />
            <Route path="*" element={<Navigate to="/game" replace />} />
          </Routes>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
        <AppContextProvider>
          <Router>
            <div className="app-container">
              <AppContent />
            </div>
          </Router>
        </AppContextProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
};

export default App;
