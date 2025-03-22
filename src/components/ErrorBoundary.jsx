import React, { Component } from 'react';
import { Alert, Button, Container, Card } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log additional environment information
    console.log("Environment Information:");
    console.log("- User Agent:", navigator.userAgent);
    console.log("- Platform:", navigator.platform);
    console.log("- Screen Size:", `${window.innerWidth}x${window.innerHeight}`);
    console.log("- Telegram Available:", !!window.Telegram);
    
    if (window.Telegram?.WebApp) {
      console.log("- Telegram WebApp Version:", window.Telegram.WebApp.version);
      console.log("- Telegram Platform:", window.Telegram.WebApp.platform);
      console.log("- Telegram ColorScheme:", window.Telegram.WebApp.colorScheme);
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleClearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container className="py-4">
          <Card className="border-danger">
            <Card.Header className="bg-danger text-white">
              <h4>Something went wrong</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <p>We encountered an error loading the application. Please try again or contact support if the issue persists.</p>
                
                <details className="mt-3">
                  <summary>Technical Details (for developers)</summary>
                  <pre className="mt-2 p-3 bg-light text-danger">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </Alert>
              
              <div className="d-flex mt-3 gap-2">
                <Button variant="primary" onClick={this.handleReload}>
                  Reload Application
                </Button>
                <Button variant="secondary" onClick={this.handleClearLocalStorage}>
                  Clear Cache & Reload
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary; 