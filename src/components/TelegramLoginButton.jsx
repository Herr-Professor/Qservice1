import React, { useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import WebApp from '@twa-dev/sdk';
import { FaTelegramPlane } from 'react-icons/fa';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const TelegramLoginButton = () => {
  const { setError } = useContext(AppContext);

  const handleLaunchViaTelegram = () => {
    alert('This app should be launched from Telegram. Please open it from the Telegram app!');
  };

  // For development/testing only - simulates Telegram data
  const handleMockTelegramLogin = () => {
    try {
      console.log("Setting up mock Telegram data for testing");
      
      // Create a proper initData string that mimics what Telegram sends
      // In a real scenario, this would be an encoded string with user data
      const mockInitData = "query_id=AAHdF6IQAAAAAN0XohDWwoVg&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22test_user%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1673000000&hash=95c6a70b6ca25bbcca7b5a0035d4f14d8927627d2fc70a46aa08e63113b7823d";
      
      // Create mock Telegram WebApp object
      window.Telegram = {
        WebApp: {
          initData: mockInitData,
          initDataUnsafe: {
            query_id: "AAHdF6IQAAAAAN0XohDWwoVg",
            user: {
              id: 123456789,
              first_name: "Test",
              last_name: "User",
              username: "test_user",
              language_code: "en"
            },
            auth_date: 1673000000,
            hash: "95c6a70b6ca25bbcca7b5a0035d4f14d8927627d2fc70a46aa08e63113b7823d",
            start_param: "test_referral"
          },
          ready: function() { console.log("Mock WebApp ready called"); },
          expand: function() { console.log("Mock WebApp expand called"); },
          isExpanded: true,
          version: "6.0"
        }
      };
      
      console.log("Mock Telegram data successfully set up", window.Telegram);
      
      // Reload the page to trigger initialization with mock data
      window.location.reload();
    } catch (error) {
      console.error("Error setting up mock Telegram data:", error);
      setError("Failed to set up mock Telegram data: " + error.message);
    }
  };

  // Add a debug button to check current Telegram data
  const debugTelegramData = () => {
    console.log("=== Telegram Debug Info ===");
    console.log("window.Telegram exists:", !!window.Telegram);
    
    if (window.Telegram) {
      console.log("window.Telegram.WebApp exists:", !!window.Telegram.WebApp);
      
      if (window.Telegram.WebApp) {
        console.log("initData exists:", !!window.Telegram.WebApp.initData);
        console.log("initDataUnsafe exists:", !!window.Telegram.WebApp.initDataUnsafe);
        
        if (window.Telegram.WebApp.initDataUnsafe) {
          console.log("User info:", window.Telegram.WebApp.initDataUnsafe.user);
          console.log("Start param:", window.Telegram.WebApp.initDataUnsafe.start_param);
        }
      }
    }
    
    console.log("=== End Debug Info ===");
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Header as="h5">Welcome to QMining</Card.Header>
        <Card.Body>
          <FaTelegramPlane size={48} className="mb-3 text-primary" />
          <Card.Title>Telegram Login Required</Card.Title>
          <Card.Text>
            This application needs to be launched from Telegram to work properly. Please open the app through Telegram to continue.
          </Card.Text>
          <Button 
            variant="primary" 
            className="d-flex align-items-center justify-content-center mx-auto mb-3"
            onClick={handleLaunchViaTelegram}
          >
            <FaTelegramPlane className="me-2" />
            Open in Telegram
          </Button>
          
          {process.env.NODE_ENV !== 'production' && (
            <>
              <Button 
                variant="outline-secondary" 
                className="d-flex align-items-center justify-content-center mx-auto mb-2"
                onClick={handleMockTelegramLogin}
              >
                Development: Mock Telegram Login
              </Button>
              <Button 
                variant="outline-info" 
                className="d-flex align-items-center justify-content-center mx-auto mb-2"
                onClick={debugTelegramData}
              >
                Debug Telegram Data
              </Button>
              <Link to="/debug" className="d-block text-center mt-2">
                <Button 
                  variant="outline-success" 
                  className="d-flex align-items-center justify-content-center mx-auto"
                >
                  Open Debug Page
                </Button>
              </Link>
            </>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          QMining - Point Mining Mini App
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default TelegramLoginButton; 