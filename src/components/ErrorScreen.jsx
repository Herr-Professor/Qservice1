import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

const ErrorScreen = ({ message }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Error</Alert.Heading>
        <p>{message || 'An unexpected error occurred.'}</p>
        <hr />
        <div className="d-flex justify-content-center">
          <Button onClick={handleRefresh} variant="outline-danger">
            Refresh Application
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default ErrorScreen; 