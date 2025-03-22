import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

const Shop = () => {
  const { buyUpgrade, buyPointCard, hasActiveUpgrade, pointCards, refreshInventory, user } = useContext(AppContext);

  const handleBuyUpgrade = async (upgradeType) => {
    try {
      await buyUpgrade(user.telegram_id, upgradeType);
      await refreshInventory(user.telegram_id);
    } catch (error) {
      console.error('Error buying upgrade:', error);
    }
  };

  const handleBuyPointCard = async (cardType) => {
    try {
      await buyPointCard(user.telegram_id, cardType);
      await refreshInventory(user.telegram_id);
    } catch (error) {
      console.error('Error buying point card:', error);
    }
  };

  return (
    <Container className="mt-3">
      <h4 className="mb-3">Upgrades</h4>
      <Row>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Always-On Mining</Card.Title>
              <Card.Text>
                Your mining node will automatically restart after each session.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">5 TON</span>
                <Button 
                  variant={hasActiveUpgrade('always_on') ? "success" : "primary"}
                  disabled={hasActiveUpgrade('always_on')}
                  onClick={() => handleBuyUpgrade('always_on')}
                >
                  {hasActiveUpgrade('always_on') ? "Active" : "Buy"}
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              Active for 7 days after purchase
            </Card.Footer>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Auto-Claim Points</Card.Title>
              <Card.Text>
                Points are automatically claimed when mining completes.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">1 TON</span>
                <Button 
                  variant={hasActiveUpgrade('auto_claim') ? "success" : "primary"}
                  disabled={hasActiveUpgrade('auto_claim')}
                  onClick={() => handleBuyUpgrade('auto_claim')}
                >
                  {hasActiveUpgrade('auto_claim') ? "Active" : "Buy"}
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              Active for 7 days after purchase
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <h4 className="mb-3 mt-4">Point Cards</h4>
      <Row>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Nano Card</Card.Title>
              <Card.Text>
                Save on 3 escrow transactions by avoiding fees.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">3 TON</span>
                <Button 
                  variant="primary"
                  onClick={() => handleBuyPointCard('nano')}
                >
                  Buy
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Xeno Card</Card.Title>
              <Card.Text>
                Save on 5 escrow transactions by avoiding fees.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">5 TON</span>
                <Button 
                  variant="primary"
                  onClick={() => handleBuyPointCard('xeno')}
                >
                  Buy
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Zero Card</Card.Title>
              <Card.Text>
                Save on 10 escrow transactions by avoiding fees.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">10 TON</span>
                <Button 
                  variant="primary"
                  onClick={() => handleBuyPointCard('zero')}
                >
                  Buy
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <h4 className="mb-3 mt-4">Your Cards</h4>
      <Row>
        {pointCards.length > 0 ? (
          pointCards.map(card => (
            <Col md={4} className="mb-3" key={card.id}>
              <Card>
                <Card.Body>
                  <Card.Title>{card.card_type.charAt(0).toUpperCase() + card.card_type.slice(1)} Card</Card.Title>
                  <Card.Text>
                    Remaining uses: {card.fees_remaining}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-muted">You don't have any point cards yet.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Shop; 