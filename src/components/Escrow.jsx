import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Container, Card, Button, Row, Col, Form, Modal, Badge, Tabs, Tab } from 'react-bootstrap';

const Escrow = () => {
  const { 
    user, 
    activeEscrows, 
    pastEscrows, 
    createEscrow, 
    releaseEscrow, 
    withdrawEscrow, 
    cancelEscrow, 
    refreshEscrows,
    pointCards 
  } = useContext(AppContext);
  
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(1);
  const [pin, setPin] = useState('');
  const [useCard, setUseCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPin, setWithdrawPin] = useState('');
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  
  // Handle escrow creation
  const handleCreateEscrow = async (e) => {
    e.preventDefault();
    if (!receiver || !amount || !pin) return;
    
    try {
      await createEscrow(
        receiver,
        parseFloat(amount),
        parseInt(lockPeriod),
        pin,
        useCard,
        useCard ? parseInt(selectedCardId) : null
      );
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating escrow:', error);
    }
  };
  
  // Handle escrow release
  const handleReleaseEscrow = async (escrowId) => {
    try {
      await releaseEscrow(escrowId);
    } catch (error) {
      console.error('Error releasing escrow:', error);
    }
  };
  
  // Handle escrow withdrawal
  const handleWithdrawEscrow = async () => {
    if (!selectedEscrow || !withdrawPin) return;
    
    try {
      await withdrawEscrow(selectedEscrow.escrow_id, withdrawPin);
      setShowWithdrawModal(false);
      setWithdrawPin('');
    } catch (error) {
      console.error('Error withdrawing from escrow:', error);
    }
  };
  
  // Handle escrow cancellation
  const handleCancelEscrow = async (escrowId) => {
    try {
      const result = await cancelEscrow(escrowId);
      alert(result.message);
    } catch (error) {
      console.error('Error cancelling escrow:', error);
    }
  };
  
  // Open withdraw modal
  const openWithdrawModal = (escrow) => {
    setSelectedEscrow(escrow);
    setShowWithdrawModal(true);
  };
  
  // Reset form fields
  const resetForm = () => {
    setReceiver('');
    setAmount('');
    setLockPeriod(1);
    setPin('');
    setUseCard(false);
    setSelectedCardId('');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'completed':
        return <Badge bg="info">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'pending_cancel':
        return <Badge bg="warning">Pending Cancel</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  return (
    <Container className="mt-3 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Escrow Service</h4>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
        >
          Create New Escrow
        </Button>
      </div>
      
      <Tabs defaultActiveKey="active" className="mb-3">
        <Tab eventKey="active" title="Active Escrows">
          {activeEscrows.length > 0 ? (
            activeEscrows.map(escrow => (
              <Card key={escrow.escrow_id} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div><strong>From:</strong> {escrow.sender_username}</div>
                      <div><strong>To:</strong> {escrow.receiver_username}</div>
                      <div><strong>Amount:</strong> {escrow.amount} TON</div>
                      <div><strong>Fee:</strong> {escrow.fee_amount} TON</div>
                      <div><strong>Created:</strong> {formatDate(escrow.creation_time)}</div>
                      <div><strong>Unlocks:</strong> {formatDate(escrow.unlock_time)}</div>
                    </Col>
                    <Col md={6} className="d-flex flex-column align-items-end justify-content-center">
                      <div className="mb-2">{getStatusBadge(escrow.status)}</div>
                      
                      {/* Show different actions based on user role and escrow state */}
                      {escrow.status === 'active' && (
                        <>
                          {user.telegram_id === escrow.sender_username && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              className="mb-2"
                              onClick={() => handleReleaseEscrow(escrow.escrow_id)}
                            >
                              Release Early
                            </Button>
                          )}
                          
                          {user.telegram_id === escrow.receiver_username && escrow.can_withdraw && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="mb-2"
                              onClick={() => openWithdrawModal(escrow)}
                            >
                              Withdraw Funds
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelEscrow(escrow.escrow_id)}
                          >
                            Request Cancel
                          </Button>
                        </>
                      )}
                      
                      {escrow.status === 'pending_cancel' && (
                        <>
                          <div className="text-warning mb-2">
                            {escrow.requested_by === user.id 
                              ? "Waiting for other party to confirm cancellation" 
                              : "Other party requested cancellation"}
                          </div>
                          
                          {escrow.requested_by !== user.id && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleCancelEscrow(escrow.escrow_id)}
                            >
                              Confirm Cancellation
                            </Button>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-muted">No active escrows.</p>
          )}
        </Tab>
        
        <Tab eventKey="history" title="Escrow History">
          {pastEscrows.length > 0 ? (
            pastEscrows.map(escrow => (
              <Card key={escrow.escrow_id} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={9}>
                      <div><strong>From:</strong> {escrow.sender_username}</div>
                      <div><strong>To:</strong> {escrow.receiver_username}</div>
                      <div><strong>Amount:</strong> {escrow.amount} TON</div>
                      <div><strong>Created:</strong> {formatDate(escrow.creation_time)}</div>
                    </Col>
                    <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
                      {getStatusBadge(escrow.status)}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-muted">No past escrows.</p>
          )}
        </Tab>
      </Tabs>
      
      {/* Create Escrow Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Escrow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEscrow}>
            <Form.Group className="mb-3">
              <Form.Label>Receiver Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter Telegram username" 
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount (TON)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.1" 
                placeholder="Enter amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.1"
              />
              <Form.Text className="text-muted">
                A 10% fee will be charged (5% from each party)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Lock Period (Days)</Form.Label>
              <Form.Control 
                type="number" 
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value)}
                required
                min="1"
                max="30"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Security PIN</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Create a PIN" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                The receiver will need this PIN to withdraw funds
              </Form.Text>
            </Form.Group>
            
            {pointCards.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  label="Use Point Card to avoid fees"
                  checked={useCard}
                  onChange={(e) => setUseCard(e.target.checked)}
                />
                
                {useCard && (
                  <Form.Select 
                    className="mt-2"
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    required={useCard}
                  >
                    <option value="">Select a card</option>
                    {pointCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.card_type.charAt(0).toUpperCase() + card.card_type.slice(1)} Card (Uses: {card.fees_remaining})
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateEscrow}>
            Create Escrow
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Withdraw Escrow Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw Funds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the security PIN to withdraw {selectedEscrow?.amount} TON.</p>
          <Form.Group>
            <Form.Label>Security PIN</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Enter PIN" 
              value={withdrawPin}
              onChange={(e) => setWithdrawPin(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleWithdrawEscrow}>
            Withdraw
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Escrow; 