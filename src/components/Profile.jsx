import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

const Profile = () => {
  const { user, connectWallet, disconnectWallet, connected, wallet, tonBalance } = useContext(AppContext);

  if (!user) {
    return <Container className="mt-3">Loading profile...</Container>;
  }

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header>
          <h5>User Profile</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col xs={4} className="text-muted">Telegram ID:</Col>
            <Col xs={8}>{user.telegram_id}</Col>
          </Row>
          <Row className="mb-3">
            <Col xs={4} className="text-muted">Username:</Col>
            <Col xs={8}>@{user.username}</Col>
          </Row>
          <Row className="mb-3">
            <Col xs={4} className="text-muted">Points Mined:</Col>
            <Col xs={8}>{user.points_mined}</Col>
          </Row>
          
          <div className="mt-4">
            <h6>Wallet Connection</h6>
            {connected ? (
              <>
                <Row className="mb-3">
                  <Col xs={4} className="text-muted">Address:</Col>
                  <Col xs={8} style={{ wordBreak: 'break-all' }}>{wallet.address}</Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={4} className="text-muted">TON Balance:</Col>
                  <Col xs={8}>{tonBalance} TON</Col>
                </Row>
                <Button variant="danger" onClick={disconnectWallet}>Disconnect Wallet</Button>
              </>
            ) : (
              <Button variant="primary" onClick={connectWallet}>Connect TON Wallet</Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile; 