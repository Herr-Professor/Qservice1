import React, { useEffect, useState } from 'react';
import { Container, Card, ListGroup, Button, Badge } from 'react-bootstrap';

const TelegramDebugPage = () => {
  const [telegramInfo, setTelegramInfo] = useState({
    available: false,
    webAppAvailable: false,
    version: null,
    platform: null,
    colorScheme: null,
    themeParams: null,
    viewportHeight: null,
    viewportStableHeight: null,
    headerColor: null,
    backgroundColor: null,
    initDataRaw: null,
    initDataUnsafe: null,
    initDataUnsafeKeys: [],
    user: null,
    startParam: null
  });

  useEffect(() => {
    gatherTelegramInfo();
  }, []);

  const gatherTelegramInfo = () => {
    const info = {
      available: !!window.Telegram,
      webAppAvailable: !!(window.Telegram && window.Telegram.WebApp),
      version: null,
      platform: null,
      colorScheme: null,
      themeParams: null,
      viewportHeight: null,
      viewportStableHeight: null,
      headerColor: null,
      backgroundColor: null,
      initDataRaw: null,
      initDataUnsafe: null,
      initDataUnsafeKeys: [],
      user: null,
      startParam: null
    };

    // If Telegram WebApp is available, gather all possible info
    if (info.webAppAvailable) {
      const WebApp = window.Telegram.WebApp;
      info.version = WebApp.version;
      info.platform = WebApp.platform;
      info.colorScheme = WebApp.colorScheme;
      info.themeParams = WebApp.themeParams;
      info.viewportHeight = WebApp.viewportHeight;
      info.viewportStableHeight = WebApp.viewportStableHeight;
      info.headerColor = WebApp.headerColor;
      info.backgroundColor = WebApp.backgroundColor;
      info.initDataRaw = WebApp.initData;
      info.initDataUnsafe = WebApp.initDataUnsafe;
      info.initDataUnsafeKeys = Object.keys(WebApp.initDataUnsafe || {});
      info.user = WebApp.initDataUnsafe?.user;
      info.startParam = WebApp.initDataUnsafe?.start_param;

      // Also try to trigger WebApp ready method
      try {
        WebApp.ready();
        console.log("WebApp.ready() called successfully");
      } catch (error) {
        console.error("Error calling WebApp.ready():", error);
      }
    }

    setTelegramInfo(info);
  };

  const refreshInfo = () => {
    gatherTelegramInfo();
  };

  // Create a query string with debug mode for direct sharing
  const debugUrl = `${window.location.origin}${window.location.pathname}?tgWebAppDebug=1`;

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Telegram WebApp Debug Information</h4>
          <Button variant="primary" size="sm" onClick={refreshInfo}>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            This page displays all available information from the Telegram WebApp integration to help diagnose initialization issues.
          </Card.Text>
          
          <h5>Debug URL</h5>
          <Card.Text>
            <a href={debugUrl} target="_blank" rel="noopener noreferrer">{debugUrl}</a>
          </Card.Text>

          <h5>Status</h5>
          <ListGroup className="mb-3">
            <ListGroup.Item>
              Telegram Global Object: 
              {telegramInfo.available ? (
                <Badge bg="success" className="ms-2">Available</Badge>
              ) : (
                <Badge bg="danger" className="ms-2">Not Available</Badge>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              WebApp Object: 
              {telegramInfo.webAppAvailable ? (
                <Badge bg="success" className="ms-2">Available</Badge>
              ) : (
                <Badge bg="danger" className="ms-2">Not Available</Badge>
              )}
            </ListGroup.Item>
          </ListGroup>

          {telegramInfo.webAppAvailable && (
            <>
              <h5>WebApp Information</h5>
              <ListGroup className="mb-3">
                <ListGroup.Item>Version: {telegramInfo.version}</ListGroup.Item>
                <ListGroup.Item>Platform: {telegramInfo.platform}</ListGroup.Item>
                <ListGroup.Item>Color Scheme: {telegramInfo.colorScheme}</ListGroup.Item>
                <ListGroup.Item>Viewport Height: {telegramInfo.viewportHeight}</ListGroup.Item>
                <ListGroup.Item>Viewport Stable Height: {telegramInfo.viewportStableHeight}</ListGroup.Item>
              </ListGroup>

              <h5>initData Information</h5>
              <ListGroup className="mb-3">
                <ListGroup.Item>
                  initData Available: 
                  {telegramInfo.initDataRaw ? (
                    <Badge bg="success" className="ms-2">Yes</Badge>
                  ) : (
                    <Badge bg="warning" className="ms-2">No</Badge>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  initDataUnsafe Available:
                  {telegramInfo.initDataUnsafeKeys.length > 0 ? (
                    <Badge bg="success" className="ms-2">Yes</Badge>
                  ) : (
                    <Badge bg="warning" className="ms-2">No</Badge>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  initDataUnsafe Keys: {telegramInfo.initDataUnsafeKeys.join(', ') || 'None'}
                </ListGroup.Item>
              </ListGroup>

              {telegramInfo.user && (
                <>
                  <h5>User Information</h5>
                  <ListGroup className="mb-3">
                    <ListGroup.Item>User ID: {telegramInfo.user.id}</ListGroup.Item>
                    <ListGroup.Item>Username: {telegramInfo.user.username || 'N/A'}</ListGroup.Item>
                    <ListGroup.Item>First Name: {telegramInfo.user.first_name}</ListGroup.Item>
                    <ListGroup.Item>Last Name: {telegramInfo.user.last_name || 'N/A'}</ListGroup.Item>
                    <ListGroup.Item>Language Code: {telegramInfo.user.language_code || 'N/A'}</ListGroup.Item>
                  </ListGroup>
                </>
              )}

              <h5>Start Parameter</h5>
              <ListGroup className="mb-3">
                <ListGroup.Item>
                  {telegramInfo.startParam || 'None'}
                </ListGroup.Item>
              </ListGroup>

              <h5>Theme Parameters</h5>
              <div className="bg-light p-3 rounded mb-3" style={{ maxHeight: '200px', overflow: 'auto' }}>
                <pre>{JSON.stringify(telegramInfo.themeParams, null, 2)}</pre>
              </div>

              <Button 
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(telegramInfo, null, 2));
                  alert('Debug information copied to clipboard');
                }}
              >
                Copy All Debug Info
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TelegramDebugPage; 