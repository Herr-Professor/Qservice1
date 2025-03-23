/**
 * API service for interacting with the backend
 */

// Determine the API URL based on the environment
let API_URL;

if (process.env.NODE_ENV === 'production') {
  // In production, use the environment variable or fallback to the render.com URL
  API_URL = process.env.REACT_APP_API_URL || 'https://qserver-ii0a.onrender.com/api';
} else {
  // In development, prefer the local environment variable if available
  API_URL = process.env.REACT_APP_API_URL || 'https://qserver-ii0a.onrender.com/api';
  
  // Log which API URL we're using in development for debugging
  console.log(`Using API URL in development: ${API_URL}`);
}

export { API_URL };

/**
 * Login or create a user via Telegram data
 * @param {Object} authData - Either {initData: string} or {userId: number}
 * @param {string} startParam - Start parameter from Telegram deeplink (optional)
 * @returns {Promise<Object>} - The user object
 */
export const loginUser = async (authData, startParam = null) => {
  try {
    console.log(`Attempting to login user with API URL: ${API_URL}`);
    
    // Validate authData - we need either initData or userId
    if (!authData || (!authData.initData && !authData.userId)) {
      console.error('Missing authentication data in loginUser function');
      throw new Error('Missing Telegram authentication data');
    }
    
    const payload = {};
    
    // Add the authentication data to the payload
    if (authData.initData) {
      payload.initData = authData.initData;
      console.log('Using initData for authentication');
    } else if (authData.userId) {
      payload.user_id = authData.userId;
      console.log('Using user_id for authentication');
    }
    
    // If we have a start parameter (for referrals), include it
    if (startParam) {
      payload.start_param = startParam;
      console.log(`Including start_param in login request: ${startParam}`);
    }
    
    console.log(`Making fetch request to: ${API_URL}/auth/check_and_create_user`);
    const response = await fetch(`${API_URL}/auth/check_and_create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(payload),
    });
    
    console.log(`Received response with status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(e => ({ error: 'Failed to parse error response' }));
      console.error('API login error:', errorData);
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('Login successful, user data received');
    return userData;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

/**
 * Get user by telegram ID
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - The user object
 */
export const getUser = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/auth/get_user?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Start mining node
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - Mining start result
 */
export const startMiningNode = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/game/start_node`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start mining node');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting mining node:', error);
    throw error;
  }
};

/**
 * Check mining node status
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - Mining status result
 */
export const checkMiningStatus = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/game/check_status?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check mining status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking mining status:', error);
    throw error;
  }
};

/**
 * Claim mining points
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - Claim result
 */
export const claimMiningPoints = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/game/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to claim mining points');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error claiming mining points:', error);
    throw error;
  }
};

/**
 * Get mining statistics
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - Mining statistics
 */
export const getMiningStats = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/game/stats?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get mining stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting mining stats:', error);
    throw error;
  }
};

/**
 * Buy an upgrade
 * @param {string} telegramId - The user's Telegram ID
 * @param {string} upgradeType - Type of upgrade ('always_on' or 'auto_claim')
 * @returns {Promise<Object>} - Purchase result
 */
export const buyUpgrade = async (telegramId, upgradeType) => {
  try {
    const response = await fetch(`${API_URL}/shop/buy_upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        upgrade_type: upgradeType
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to buy upgrade');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error buying upgrade:', error);
    throw error;
  }
};

/**
 * Buy a point card
 * @param {string} telegramId - The user's Telegram ID
 * @param {string} cardType - Type of card ('nano', 'xeno', or 'zero')
 * @returns {Promise<Object>} - Purchase result
 */
export const buyPointCard = async (telegramId, cardType) => {
  try {
    const response = await fetch(`${API_URL}/shop/buy_card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        card_type: cardType
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to buy point card');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error buying point card:', error);
    throw error;
  }
};

/**
 * Get user inventory (upgrades and point cards)
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - User inventory
 */
export const getUserInventory = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/shop/inventory?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get inventory');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting inventory:', error);
    throw error;
  }
};

/**
 * Create escrow
 * @param {string} senderTelegramId - Sender's Telegram ID
 * @param {string} receiverUsername - Receiver's Telegram username
 * @param {number} amount - Amount to lock in escrow (TON)
 * @param {number} lockPeriod - Lock period in days
 * @param {string} pin - PIN for escrow security
 * @param {boolean} usePointCard - Whether to use a point card for fees
 * @param {number} cardId - ID of the point card to use (if applicable)
 * @returns {Promise<Object>} - Escrow creation result
 */
export const createEscrow = async (senderTelegramId, receiverUsername, amount, lockPeriod, pin, usePointCard = false, cardId = null) => {
  try {
    const payload = {
      sender_telegram_id: senderTelegramId,
      receiver_username: receiverUsername,
      amount: Number(amount),
      lock_period: Number(lockPeriod),
      pin: pin
    };
    
    if (usePointCard) {
      payload.use_point_card = true;
      payload.card_id = cardId;
    }
    
    const response = await fetch(`${API_URL}/escrow/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Escrow creation failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating escrow:', error);
    throw error;
  }
};

/**
 * Get escrow details
 * @param {string} escrowId - Unique escrow ID
 * @returns {Promise<Object>} - Escrow details
 */
export const getEscrowInfo = async (escrowId) => {
  try {
    const response = await fetch(`${API_URL}/escrow/info/${escrowId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get escrow info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting escrow info:', error);
    throw error;
  }
};

/**
 * Release escrow early (sender only)
 * @param {string} escrowId - Unique escrow ID
 * @param {string} telegramId - Sender's Telegram ID
 * @returns {Promise<Object>} - Release result
 */
export const releaseEscrow = async (escrowId, telegramId) => {
  try {
    const response = await fetch(`${API_URL}/escrow/release/${escrowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Escrow release failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Withdraw from escrow (receiver only)
 * @param {string} escrowId - Unique escrow ID
 * @param {string} telegramId - Receiver's Telegram ID
 * @param {string} pin - PIN for withdrawal
 * @returns {Promise<Object>} - Withdrawal result
 */
export const withdrawEscrow = async (escrowId, telegramId, pin) => {
  try {
    const response = await fetch(`${API_URL}/escrow/withdraw/${escrowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        pin: pin
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Escrow withdrawal failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error withdrawing from escrow:', error);
    throw error;
  }
};

/**
 * Cancel escrow
 * @param {string} escrowId - Unique escrow ID
 * @param {string} telegramId - User's Telegram ID
 * @returns {Promise<Object>} - Cancellation result with status (success or pending)
 */
export const cancelEscrow = async (escrowId, telegramId) => {
  try {
    const response = await fetch(`${API_URL}/escrow/cancel/${escrowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Escrow cancellation failed');
    }
    
    const result = await response.json();
    // The result will contain a status field indicating if the cancellation is 
    // complete (status: 'success') or waiting for the other party (status: 'pending')
    return result;
  } catch (error) {
    console.error('Error cancelling escrow:', error);
    throw error;
  }
};

/**
 * List user's escrows
 * @param {string} telegramId - User's Telegram ID
 * @returns {Promise<Object>} - List of active and past escrows
 */
export const listEscrows = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/escrow/list?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to list escrows');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error listing escrows:', error);
    throw error;
  }
};

/**
 * Get user's referral information
 * @param {string} telegramId - The user's Telegram ID
 * @returns {Promise<Object>} - Referral data including code, link, and referred users
 */
export const getUserReferrals = async (telegramId) => {
  try {
    const response = await fetch(`${API_URL}/auth/get_referrals?telegram_id=${encodeURIComponent(telegramId)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get referrals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting referrals:', error);
    throw error;
  }
};