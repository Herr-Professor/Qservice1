import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PageHeader = ({ title, children }) => {
  return (
    <div className="page-header bg-light py-3">
      <Container>
        <Row className="align-items-center">
          <Col>
            <h1 className="h4 mb-0">{title}</h1>
          </Col>
          {children && <Col xs="auto">{children}</Col>}
        </Row>
      </Container>
    </div>
  );
};

export default PageHeader; 