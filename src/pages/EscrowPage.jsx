import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const EscrowPage = () => {
  const { user, escrows, createEscrow, releaseEscrow, connected, wallet, connectWallet } = useAppContext();

  const [newEscrow, setNewEscrow] = useState({
    receiverTelegramUsername: '',
    amount: '',
    lockPeriod: 14,
    pin: '',
  });

  const [activeTab, setActiveTab] = useState('active');
  const [usePoints, setUsePoints] = useState(false);
  const [releasePin, setReleasePin] = useState({});

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate lock end date
  const getLockEndDate = (createdAt, lockPeriod) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + lockPeriod);
    return formatDate(date);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEscrow(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle release pin input changes
  const handleReleasePinChange = (escrowId, value) => {
    setReleasePin(prev => ({
      ...prev,
      [escrowId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newEscrow.receiverTelegramUsername && newEscrow.amount && newEscrow.pin) {
      createEscrow(
        newEscrow.receiverTelegramUsername,
        parseFloat(newEscrow.amount),
        parseInt(newEscrow.lockPeriod),
        newEscrow.pin
      );
      // Reset form
      setNewEscrow({
        receiverTelegramUsername: '',
        amount: '',
        lockPeriod: 14,
        pin: '',
      });
    }
  };

  // Filter escrows based on active tab
  const filteredEscrows = escrows.filter(escrow => {
    if (activeTab === 'active') return escrow.status === 'locked';
    if (activeTab === 'completed') return escrow.status === 'released' || escrow.status === 'cancelled';
    return true;
  });

  // Check if user has enough points to cover fee
  const hasEnoughPoints = (fee) => {
    const pointsNeeded = fee * 100; // 1 point = 0.01 TON
    return user.points >= pointsNeeded;
  };

  return (
    <div className="container">
      <div className="page-title">Escrow Service</div>
      {!connected ? (
        <div className="card" style={{ backgroundColor: 'rgba(229, 57, 53, 0.1)' }}>
          <h3>Connect Wallet</h3>
          <div className="divider"></div>
          <p>Please connect your TON wallet to use the escrow service.</p>
          <button className="button mt-16" onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>Create New Escrow</h3>
            <div className="divider"></div>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="receiverTelegramUsername">Receiver Telegram Username</label>
                <input
                  type="text"
                  id="receiverTelegramUsername"
                  name="receiverTelegramUsername"
                  className="input"
                  placeholder="Enter receiver's Telegram username"
                  value={newEscrow.receiverTelegramUsername}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="amount">Amount (TON)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="input"
                  placeholder="Enter amount in TON"
                  value={newEscrow.amount}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label htmlFor="lockPeriod">Lock Period (days)</label>
                <input
                  type="number"
                  id="lockPeriod"
                  name="lockPeriod"
                  className="input"
                  placeholder="Enter lock period in days"
                  value={newEscrow.lockPeriod}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  required
                />
              </div>
              <div>
                <label htmlFor="pin">PIN</label>
                <input
                  type="password"
                  id="pin"
                  name="pin"
                  className="input"
                  placeholder="Enter PIN to lock escrow"
                  value={newEscrow.pin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <p><strong>Fee:</strong> 5% from sender ({newEscrow.amount ? parseFloat(newEscrow.amount) * 0.05 : 0} TON)</p>
                <p><strong>Total:</strong> {newEscrow.amount ? parseFloat(newEscrow.amount) * 1.05 : 0} TON</p>
              </div>
              <button type="submit" className="button">
                Create Escrow
              </button>
            </form>
          </div>
          <div className="card mt-16">
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <button
                className={`button ${activeTab === 'active' ? '' : 'button-outline'}`}
                style={{ flex: 1, marginRight: '8px' }}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button
                className={`button ${activeTab === 'completed' ? '' : 'button-outline'}`}
                style={{ flex: 1, marginLeft: '8px' }}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
            </div>
            <div className="divider"></div>
            {filteredEscrows.length === 0 ? (
              <p className="text-center">No {activeTab} escrows found.</p>
            ) : (
              filteredEscrows.map(escrow => (
                <div key={escrow.id} className="card escrow-card" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`escrow-status ${escrow.status}`}>
                      {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
                      {formatDate(escrow.createdAt)}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Amount:</span>
                      <strong>{escrow.amount} TON</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Fee:</span>
                      <strong>{escrow.fee} TON</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lock Until:</span>
                      <strong>{getLockEndDate(escrow.createdAt, escrow.lockPeriod)}</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: 'var(--tg-theme-hint-color)' }}>From: </span>
                      <span>{escrow.sender_telegram_username}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--tg-theme-hint-color)' }}>To: </span>
                      <span>{escrow.receiver_telegram_username}</span>
                    </div>
                  </div>
                  {escrow.status === 'locked' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <input
                          type="checkbox"
                          id={`usePoints-${escrow.id}`}
                          checked={usePoints}
                          onChange={() => setUsePoints(!usePoints)}
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor={`usePoints-${escrow.id}`}>
                          Use points instead of TON for receiver fee
                          {usePoints && !hasEnoughPoints(escrow.fee) && (
                            <span style={{ color: 'var(--danger-color)', marginLeft: '4px' }}>
                              (Not enough points)
                            </span>
                          )}
                        </label>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label htmlFor={`releasePin-${escrow.id}`}>Enter PIN to release</label>
                        <input
                          type="password"
                          id={`releasePin-${escrow.id}`}
                          className="input"
                          placeholder="Enter PIN"
                          value={releasePin[escrow.id] || ''}
                          onChange={(e) => handleReleasePinChange(escrow.id, e.target.value)}
                        />
                      </div>
                      <button
                        className="button"
                        onClick={() => releaseEscrow(escrow.id, releasePin[escrow.id])}
                        disabled={usePoints && !hasEnoughPoints(escrow.fee)}
                        style={{
                          opacity: (usePoints && !hasEnoughPoints(escrow.fee)) ? 0.5 : 1,
                          cursor: (usePoints && !hasEnoughPoints(escrow.fee)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Release Escrow
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      <div className="card mt-16" style={{ backgroundColor: 'rgba(58, 134, 255, 0.1)' }}>
        <h3>How Escrow Works</h3>
        <div className="divider"></div>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Sender creates an escrow with a 5% fee</li>
          <li>Receiver pays 5% fee when withdrawing</li>
          <li>Use your points to offset fees</li>
          <li>After 14 days, receiver can withdraw without permission</li>
        </ul>
      </div>
    </div>
  );
};

export default EscrowPage;