import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  getUser, 
  startMiningNode, 
  checkMiningStatus, 
  claimMiningPoints, 
  getUserInventory,
  createEscrow,
  releaseEscrow,
  withdrawEscrow,
  cancelEscrow,
  listEscrows,
  getUserReferrals,
  API_URL
} from '../services/api';

// Export the context directly so it can be imported in other files
export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  // Wallet connection
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [tonBalance, setTonBalance] = useState(0);

  // User data
  const [user, setUser] = useState(null);
  const [pointCards, setPointCards] = useState([]);
  const [upgrades, setUpgrades] = useState([]);

  // Mining state
  const [miningState, setMiningState] = useState({
    status: 'off',
    timeLeft: 0,
    canClaim: false,
    pointsMined: 0
  });

  // Escrow state
  const [activeEscrows, setActiveEscrows] = useState([]);
  const [pastEscrows, setPastEscrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referral state
  const [referralData, setReferralData] = useState(null);

  // Initialize user with actual Telegram data on app load
  useEffect(() => {
    const initUser = async () => {
      try {
        console.log("Starting app initialization...");
        
        // Check if it's development or production
        const isDev = process.env.NODE_ENV === 'development';
        console.log(`Running in ${isDev ? 'development' : 'production'} mode`);
        
        // Get Telegram user data from WebApp API
        console.log("Attempting to access Telegram WebApp API...");
        
        // Make sure we have window.Telegram before trying to access it
        if (!window.Telegram) {
          console.error("window.Telegram is not defined");
          throw new Error("Telegram WebApp is not available - ensure you're launching from Telegram");
        }
        
        if (!window.Telegram.WebApp) {
          console.error("window.Telegram.WebApp is not defined");
          throw new Error("Telegram WebApp API is not available");
        }
        
        const telegramInitData = window.Telegram.WebApp.initData;
        console.log("Telegram initData available:", !!telegramInitData);
        
        // Check if we have initDataUnsafe (user info) even if we don't have initData
        // This can happen when launched from keyboard or inline mode
        const hasUserData = !!window.Telegram.WebApp.initDataUnsafe?.user;
        console.log("User data available:", hasUserData);
        
        // Log all available initDataUnsafe properties to help debug
        console.log("Available initDataUnsafe properties:", 
          Object.keys(window.Telegram.WebApp.initDataUnsafe || {}).join(', '));
          
        // In production, we now accept either proper initData OR user data from initDataUnsafe
        if (!isDev && !telegramInitData && !hasUserData) {
          console.error("No Telegram user data available in production mode");
          throw new Error("Missing Telegram authentication data - please launch from Telegram");
        }
        
        // Get start parameter if available from Telegram deeplink
        let startParam = null;
        if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
          startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
          console.log("Referral code from start_param:", startParam);
        } else {
          console.log("No start_param available");
        }
        
        // Create userId manually from initDataUnsafe if initData is not available
        // This handles cases where the app is launched from keyboard or inline mode
        let manualUserId = null;
        if (!telegramInitData && hasUserData) {
          manualUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
          console.log("Using user ID from initDataUnsafe:", manualUserId);
        }
        
        // Login or create user
        setLoading(true);
        console.log("Calling backend API for user login/creation...");
        console.log("API URL:", API_URL || 'Not defined');
        
        // Log the initData being sent to the server (NEVER do this in production with real user data)
        if (isDev) {
          console.log("Sending initData:", telegramInitData ? telegramInitData.substring(0, 20) + "..." : "[NOT AVAILABLE]");
          console.log("User ID from initDataUnsafe:", manualUserId);
        } else {
          console.log("Sending initData:", telegramInitData ? "[AVAILABLE]" : "[NOT AVAILABLE]");
          console.log("User ID available:", !!manualUserId);
        }
        
        // Send either initData or manually created object with user ID
        const userData = await loginUser(
          telegramInitData ? { initData: telegramInitData } : { userId: manualUserId },
          startParam
        );
        
        console.log("User data received:", userData ? "Success" : "Failed");
        
        if (!userData) {
          throw new Error("Failed to retrieve user data from server");
        }
        
        setUser(userData);
        
        // Fetch user's mining status
        console.log("Fetching mining status...");
        await refreshMiningStatus(userData.telegram_id);
        
        // Fetch user's inventory
        console.log("Fetching inventory...");
        await refreshInventory(userData.telegram_id);
        
        // Fetch user's escrows
        console.log("Fetching escrows...");
        await refreshEscrows(userData.telegram_id);
        
        // Fetch user's referrals
        console.log("Fetching referrals...");
        await refreshReferrals(userData.telegram_id);
        
        console.log("App initialization completed successfully");
        setError(null);
      } catch (error) {
        console.error('Error initializing user:', error);
        // Add more detailed error information
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : 'No response object'
        });
        
        // Provide more specific error message based on the error
        if (error.message.includes("Telegram WebApp is not available")) {
          setError('Please launch this app from Telegram.');
        } else if (error.message.includes("Missing Telegram authentication")) {
          setError('Authentication failed. Please try again or relaunch from Telegram.');
        } else if (error.message.includes("Failed to retrieve user data")) {
          setError('Failed to connect to the server. Please check your connection and try again.');
        } else {
          setError('Failed to initialize app. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Check if we have window.Telegram before proceeding
    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp detected, initializing...");
      initUser();
    } else if (process.env.NODE_ENV === 'development') {
      // In development, we can proceed without Telegram data
      console.warn("No Telegram WebApp detected but running in development mode. Proceeding with initialization...");
      initUser();
    } else {
      console.warn("No Telegram WebApp detected. Running in standalone mode or production environment.");
      setError('Please launch this app from Telegram.');
    }
  }, []);

  // Refresh user's mining status
  const refreshMiningStatus = async (telegramId) => {
    if (!telegramId) return;
    
    try {
      const status = await checkMiningStatus(telegramId);
      setMiningState({
        status: status.node_status,
        timeLeft: status.remaining_time,
        canClaim: status.can_claim,
        pointsMined: status.total_points
      });
      
      // Update user's total points
      if (user) {
        setUser(prev => ({
          ...prev,
          points_mined: status.total_points
        }));
      }
    } catch (error) {
      console.error('Error refreshing mining status:', error);
    }
  };

  // Refresh user's inventory
  const refreshInventory = async (telegramId) => {
    if (!telegramId) return;
    
    try {
      const inventory = await getUserInventory(telegramId);
      setUpgrades(inventory.upgrades);
      setPointCards(inventory.point_cards);
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    }
  };

  // Refresh user's escrows
  const refreshEscrows = async (telegramId) => {
    if (!telegramId) return;
    
    try {
      const escrowData = await listEscrows(telegramId);
      setActiveEscrows(escrowData.active_escrows);
      setPastEscrows(escrowData.past_escrows);
    } catch (error) {
      console.error('Error refreshing escrows:', error);
    }
  };

  // Fetch user's referrals
  const refreshReferrals = async (telegramId) => {
    if (!telegramId) return;
    
    try {
      const data = await getUserReferrals(telegramId);
      setReferralData(data);
    } catch (error) {
      console.error('Error refreshing referrals:', error);
    }
  };

  // Start mining function
  const startMining = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await startMiningNode(user.telegram_id);
      await refreshMiningStatus(user.telegram_id);
    } catch (error) {
      console.error('Error starting mining:', error);
      setError('Failed to start mining. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Claim points function
  const handleClaimPoints = async () => {
    if (!user || !miningState.canClaim) return;
    
    try {
      setLoading(true);
      await claimMiningPoints(user.telegram_id);
      await refreshMiningStatus(user.telegram_id);
    } catch (error) {
      console.error('Error claiming points:', error);
      setError('Failed to claim points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create escrow function
  const createNewEscrow = async (receiverUsername, amount, lockPeriod, pin, usePointCard = false, cardId = null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await createEscrow(
        user.telegram_id, 
        receiverUsername, 
        amount, 
        lockPeriod, 
        pin,
        usePointCard,
        cardId
      );
      
      // Refresh escrows and inventory after creation
      await refreshEscrows(user.telegram_id);
      if (usePointCard) {
        await refreshInventory(user.telegram_id);
      }
      
      return result.escrow.escrow_id;
    } catch (error) {
      console.error('Error creating escrow:', error);
      setError('Failed to create escrow. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Release escrow function
  const releaseEscrowFunc = async (escrowId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await releaseEscrow(escrowId, user.telegram_id);
      await refreshEscrows(user.telegram_id);
    } catch (error) {
      console.error('Error releasing escrow:', error);
      setError('Failed to release escrow. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw from escrow function
  const withdrawEscrowFunc = async (escrowId, pin) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await withdrawEscrow(escrowId, user.telegram_id, pin);
      await refreshEscrows(user.telegram_id);
    } catch (error) {
      console.error('Error withdrawing from escrow:', error);
      setError('Failed to withdraw from escrow. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel escrow function
  const cancelEscrowFunc = async (escrowId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await cancelEscrow(escrowId, user.telegram_id);
      await refreshEscrows(user.telegram_id);
      
      // Return the status so UI can show appropriate messages
      return {
        status: result.status,
        message: result.message
      };
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      setError('Failed to cancel escrow. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connect TON wallet
  const connectWallet = async () => {
    try {
      // Assuming tonConnect is a TON wallet SDK (e.g., TON Connect)
      const tonConnect = window.TONConnect || {};
      const walletAddress = await tonConnect.connect();
      
      setWallet({
        address: walletAddress,
        network: 'mainnet'
      });
      setConnected(true);
      
      // Update user with wallet address
      // This would need a backend API endpoint to update user's wallet address
      // For now, just update the local state
      if (user) {
        setUser(prev => ({
          ...prev,
          wallet_address: walletAddress
        }));
      }
      
      await refreshTONBalance();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnected(false);
    setWallet(null);
    setTonBalance(0);
  };

  // Refresh TON balance
  const refreshTONBalance = async () => {
    if (connected && wallet) {
      try {
        const tonConnect = window.TONConnect || {};
        const balance = await tonConnect.getBalance(wallet.address);
        setTonBalance(balance);
      } catch (error) {
        console.error('Error fetching TON balance:', error);
      }
    }
  };

  // Check if user has an active upgrade
  const hasActiveUpgrade = (upgradeType) => {
    return upgrades.some(upgrade => 
      upgrade.upgrade_type === upgradeType && 
      new Date(upgrade.expiry_time) > new Date()
    );
  };

  return (
    <AppContext.Provider
      value={{
        // User data
        user,
        loading,
        error,
        setError,
        
        // Wallet
        connected,
        wallet,
        tonBalance,
        connectWallet,
        disconnectWallet,
        refreshTONBalance,
        
        // Mining
        miningState,
        startMining,
        handleClaimPoints,
        refreshMiningStatus,
        
        // Inventory
        pointCards,
        upgrades,
        hasActiveUpgrade,
        refreshInventory,
        
        // Escrow
        activeEscrows,
        pastEscrows,
        createEscrow: createNewEscrow,
        releaseEscrow: releaseEscrowFunc,
        withdrawEscrow: withdrawEscrowFunc,
        cancelEscrow: cancelEscrowFunc,
        refreshEscrows,
        
        // Referrals
        referralData,
        refreshReferrals
      }}
    >
      {children}
    </AppContext.Provider>
  );
};