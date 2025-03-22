import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ShopPage = () => {
  const { user, purchaseUpgrade, connected, connectWallet } = useAppContext();
  const [activeTab, setActiveTab] = useState('upgrades');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState({
    type: '',
    name: '',
    cost: 0,
    description: '',
  });
  
  // Available upgrades
  const upgrades = [
    {
      id: 'autoClaimActive',
      name: 'Auto-Claim',
      cost: 500,
      description: 'Automatically claim points when mining completes',
      owned: user.upgrades.autoClaimActive,
    },
    {
      id: 'alwaysOnActive',
      name: 'Always-On Mining',
      cost: 1000,
      description: 'Continue mining even when you close the app',
      owned: user.upgrades.alwaysOnActive,
    },
    {
      id: 'miningSpeed',
      name: 'Mining Speed Boost',
      cost: 750,
      description: `Increase mining speed by 0.5x (Current: ${user.upgrades.miningSpeed}x)`,
      owned: user.upgrades.miningSpeed >= 5, // Max speed is 5x
    },
  ];
  
  // Available point cards
  const pointCards = [
    {
      id: 'small_card',
      name: 'Small Points Card',
      cost: 1,
      points: 100,
      description: '100 points to use for escrow fees',
    },
    {
      id: 'medium_card',
      name: 'Medium Points Card',
      cost: 5,
      points: 550,
      description: '550 points to use for escrow fees (10% bonus)',
    },
    {
      id: 'large_card',
      name: 'Large Points Card',
      cost: 10,
      points: 1200,
      description: '1,200 points to use for escrow fees (20% bonus)',
    },
  ];
  
  // Handle upgrade purchase
  const handleUpgradePurchase = () => {
    if (purchaseUpgrade(purchaseDetails.type, purchaseDetails.cost)) {
      setShowPurchaseModal(false);
      // Show success message
      alert(`Successfully purchased ${purchaseDetails.name}!`);
    } else {
      // Show error message
      alert('Not enough points to make this purchase.');
    }
  };
  
  // Handle point card purchase
  const handlePointCardPurchase = () => {
    // In a real app, this would connect to TON blockchain
    alert(`This would initiate a TON payment of ${purchaseDetails.cost} TON for ${purchaseDetails.points} points.`);
    setShowPurchaseModal(false);
  };
  
  // Show purchase confirmation modal
  const showPurchaseConfirmation = (item, type) => {
    setPurchaseDetails({
      type: item.id,
      name: item.name,
      cost: type === 'upgrade' ? item.cost : item.cost,
      description: item.description,
      points: type === 'points' ? item.points : 0,
    });
    setShowPurchaseModal(true);
  };

  return (
    <div className="container">
      <div className="page-title">Shop</div>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Your Balance</h3>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.points} Points</div>
            {connected && <div style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>TON Connected ✓</div>}
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <button
            className={`button ${activeTab === 'upgrades' ? '' : 'button-outline'}`}
            style={{ flex: 1, marginRight: '8px' }}
            onClick={() => setActiveTab('upgrades')}
          >
            Upgrades
          </button>
          <button
            className={`button ${activeTab === 'points' ? '' : 'button-outline'}`}
            style={{ flex: 1, marginLeft: '8px' }}
            onClick={() => setActiveTab('points')}
          >
            Point Cards
          </button>
        </div>
      </div>
      
      {activeTab === 'upgrades' && (
        <div className="card mt-16">
          <h3>Mining Upgrades</h3>
          <p style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '16px' }}>
            Spend your mined points to improve your mining capabilities
          </p>
          
          <div className="divider"></div>
          
          {upgrades.map(upgrade => (
            <div
              key={upgrade.id}
              className="card"
              style={{ marginBottom: '12px', backgroundColor: 'var(--tg-theme-bg-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{upgrade.name}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
                    {upgrade.description}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {upgrade.cost} Points
                  </div>
                  
                  {upgrade.owned ? (
                    <span style={{ color: 'var(--success-color)' }}>Owned</span>
                  ) : (
                    <button
                      className="button"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => showPurchaseConfirmation(upgrade, 'upgrade')}
                      disabled={user.points < upgrade.cost}
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'points' && (
        <div className="card mt-16">
          <h3>Point Cards</h3>
          <p style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '16px' }}>
            Purchase points with TON to use for escrow fees
          </p>
          
          <div className="divider"></div>
          
          {!connected ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ marginBottom: '16px' }}>Connect your TON wallet to purchase point cards</p>
              <button className="button" onClick={connectWallet}>Connect Wallet</button>
            </div>
          ) : (
            pointCards.map(card => (
              <div
                key={card.id}
                className="card"
                style={{ marginBottom: '12px', backgroundColor: 'var(--tg-theme-bg-color)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>{card.name}</h4>
                    <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
                      {card.description}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {card.cost} TON
                    </div>
                    
                    <button
                      className="button"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => showPurchaseConfirmation(card, 'points')}
                    >
                      Buy Points
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Purchase confirmation modal */}
      {showPurchaseModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--tg-theme-bg-color)',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '320px',
            }}
          >
            <h3>Confirm Purchase</h3>
            <div className="divider"></div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4>{purchaseDetails.name}</h4>
              <p style={{ color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
                {purchaseDetails.description}
              </p>
            </div>
            
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {purchaseDetails.points ? (
                  <span>{purchaseDetails.cost} TON</span>
                ) : (
                  <span>{purchaseDetails.cost} Points</span>
                )}
              </div>
              
              {purchaseDetails.points > 0 && (
                <div style={{ color: 'var(--success-color)', marginTop: '4px' }}>
                  You'll receive {purchaseDetails.points} points
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="button button-outline"
                style={{ flex: 1 }}
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </button>
              
              <button
                className="button"
                style={{ flex: 1 }}
                onClick={purchaseDetails.points > 0 ? handlePointCardPurchase : handleUpgradePurchase}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
