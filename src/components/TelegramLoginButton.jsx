import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import WebApp from '@twa-dev/sdk';
import { FaTelegramPlane } from 'react-icons/fa';

const TelegramLoginButton = () => {
  const handleLaunchViaTelegram = () => {
    alert('This app should be launched from Telegram. Please open it from the Telegram app!');
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
            className="d-flex align-items-center justify-content-center mx-auto"
            onClick={handleLaunchViaTelegram}
          >
            <FaTelegramPlane className="me-2" />
            Open in Telegram
          </Button>
        </Card.Body>
        <Card.Footer className="text-muted">
          QMining - Point Mining Mini App
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default TelegramLoginButton; 