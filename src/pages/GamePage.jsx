import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { startMiningNode, checkMiningStatus, claimMiningPoints, getUserInventory } from '../services/api';

const GamePage = () => {
  const { user } = useAppContext();
  const [nodeStatus, setNodeStatus] = useState('off');
  const [remainingTime, setRemainingTime] = useState(0);
  const [pointsMined, setPointsMined] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrades, setUpgrades] = useState([]);

  // Format time in HH:MM:SS
  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalTime = 10800; // 3 hours in seconds
    const elapsed = totalTime - remainingTime;
    return Math.min((elapsed / totalTime) * 100, 100);
  };

  // Fetch mining status
  const fetchMiningStatus = async () => {
    if (!user) return;
    
    try {
      const status = await checkMiningStatus(user.telegram_id);
      setNodeStatus(status.node_status);
      setRemainingTime(status.remaining_time);
      setPointsMined(status.total_points);
      setCanClaim(status.can_claim);
      
      // Clear error if successful
      setError(null);
    } catch (err) {
      console.error('Error fetching mining status:', err);
      setError('Failed to update mining status');
    }
  };

  // Fetch user's upgrades
  const fetchUserUpgrades = async () => {
    if (!user) return;
    
    try {
      const inventory = await getUserInventory(user.telegram_id);
      setUpgrades(inventory.upgrades);
    } catch (err) {
      console.error('Error fetching user upgrades:', err);
    }
  };

  // Start polling for status updates when component mounts
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    setIsLoading(true);
    Promise.all([fetchMiningStatus(), fetchUserUpgrades()])
      .finally(() => setIsLoading(false));
    
    // Set up polling interval
    const interval = setInterval(() => {
      fetchMiningStatus();
    }, 5000); // Update every 5 seconds
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [user]);

  // Handle Start Mining button click
  const handleStartMining = async () => {
    if (!user || nodeStatus === 'on' || isLoading) return;
    
    try {
      setIsLoading(true);
      await startMiningNode(user.telegram_id);
      await fetchMiningStatus();
    } catch (err) {
      console.error('Error starting mining node:', err);
      setError('Failed to start mining');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Claim Points button click
  const handleClaimPoints = async () => {
    if (!user || !canClaim || isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await claimMiningPoints(user.telegram_id);
      setPointsMined(result.total_points);
      await fetchMiningStatus();
    } catch (err) {
      console.error('Error claiming points:', err);
      setError('Failed to claim points');
    } finally {
      setIsLoading(false);
    }
  };

  // Get upgrade expiry date
  const getUpgradeExpiryDate = (upgradeType) => {
    const upgrade = upgrades.find(u => u.upgrade_type === upgradeType && u.is_active);
    if (upgrade) {
      const expiryDate = new Date(upgrade.expiry_time);
      return expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return null;
  };

  // Check if upgrade is active
  const hasActiveUpgrade = (upgradeType) => {
    return upgrades.some(u => u.upgrade_type === upgradeType && u.is_active);
  };

  return (
    <div className="container">
      <div className="page-title">Mining Station</div>
      
      {user && (
        <div className="card mb-16">
          <h3 className="text-center">Hello, {user.username}!</h3>
          <p className="text-center">Points Mined: {pointsMined}</p>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${nodeStatus === 'on' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Node Status: {nodeStatus === 'on' ? 'Running' : 'Inactive'}</span>
          </div>
          
          {/* Upgrade Status Section */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm text-center mb-2">Active Upgrades</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-xs flex justify-between">
                <span>Always On:</span>
                <span>
                  {hasActiveUpgrade('always_on') 
                    ? <span className="text-green-400">Active until {getUpgradeExpiryDate('always_on')}</span> 
                    : <span className="text-gray-400">Inactive</span>}
                </span>
              </div>
              <div className="text-xs flex justify-between">
                <span>Auto Claim:</span>
                <span>
                  {hasActiveUpgrade('auto_claim') 
                    ? <span className="text-green-400">Active until {getUpgradeExpiryDate('auto_claim')}</span> 
                    : <span className="text-gray-400">Inactive</span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="card mb-16 bg-red-900/20">
          <p className="text-center text-red-300">{error}</p>
        </div>
      )}
      
      <div className="mining-container">
        {nodeStatus === 'on' ? (
          <>
            <div className="mining-node active" style={{ animation: 'pulse 2s infinite' }}>
              MINING
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <p>Time Remaining</p>
              <h2>{formatTimeLeft(remainingTime)}</h2>
              
              <div className="mining-progress">
                <div
                  className="mining-progress-bar"
                  style={{
                    width: `${calculateProgress()}%`,
                    height: '8px',
                    background: 'linear-gradient(to right, #4c1d95, #8b5cf6)',
                    borderRadius: '4px',
                    transition: 'width 1s ease'
                  }}
                ></div>
              </div>
              
              {canClaim ? (
                <>
                  <p className="mt-4">Mining Complete!</p>
                  <button
                    className="button mt-4"
                    onClick={handleClaimPoints}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Claim Points'}
                  </button>
                </>
              ) : (
                <p className="mt-4">Mining in progress... Check back later or wait for auto-claim.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div 
              className="mining-node inactive"
              onClick={handleStartMining}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? '...' : 'START'}
            </div>
            
            <button
              className="button mt-16"
              onClick={handleStartMining}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Turn On Mining Node'}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-400">
              Start mining to earn TON points!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GamePage;