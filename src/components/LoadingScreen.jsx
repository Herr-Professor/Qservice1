import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

const LoadingScreen = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" role="status" className="mb-3" />
      <p className="text-center">Loading the application...</p>
    </Container>
  );
};

export default LoadingScreen; 