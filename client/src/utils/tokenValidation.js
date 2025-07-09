/**
 * Utility functions for token validation
 */

/**
 * Decode JWT token without verification (for client-side expiration check)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Check if token will expire soon (within specified minutes)
 * @param {string} token - JWT token
 * @param {number} warningMinutes - Minutes before expiration to warn (default: 30)
 * @returns {object} - Expiration status with time remaining
 */
export const getTokenExpirationStatus = (token, warningMinutes = 30) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return { isExpired: true, isExpiringSoon: false, timeRemaining: 0 };
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = decoded.exp - currentTime;
  const warningThreshold = warningMinutes * 60; // Convert to seconds
  
  return {
    isExpired: timeRemaining <= 0,
    isExpiringSoon: timeRemaining > 0 && timeRemaining <= warningThreshold,
    timeRemaining: Math.max(0, timeRemaining),
    timeRemainingFormatted: formatTimeRemaining(Math.max(0, timeRemaining))
  };
};

/**
 * Format time remaining in human readable format
 * @param {number} seconds - Seconds remaining
 * @returns {string} - Formatted time string
 */
const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '0 minutes';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Validate regular user token from localStorage
 * @returns {object} - Validation result with token and user data
 */
export const validateUserToken = () => {
  const userData = localStorage.getItem("exim_user");
  
  if (!userData) {
    return { isValid: false, token: null, userData: null, reason: 'missing' };
  }
  
  try {
    const parsedUserData = JSON.parse(userData);
    
    // Check if we have access_token (from cookies) by making a test request
    // For now, we'll assume the token is valid if user data exists
    // In a production app, you'd want to make a validation API call
    
    return { isValid: true, token: 'cookie-based', userData: parsedUserData, reason: null };
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("exim_user");
    return { isValid: false, token: null, userData: null, reason: 'parse_error' };
  }
};

/**
 * Validate SuperAdmin token and clear if expired
 * @returns {object} - Validation result with token and user data
 */
export const validateSuperAdminToken = () => {
  const token = localStorage.getItem("superadmin_token");
  const userData = localStorage.getItem("superadmin_user");
  
  if (!token || !userData) {
    return { isValid: false, token: null, userData: null, reason: 'missing' };
  }
  
  if (isTokenExpired(token)) {
    // Clear expired token
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_user");
    return { isValid: false, token: null, userData: null, reason: 'expired' };
  }
  
  try {
    const parsedUserData = JSON.parse(userData);
    if (parsedUserData.role !== "superadmin") {
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      return { isValid: false, token: null, userData: null, reason: 'invalid_role' };
    }
    
    return { isValid: true, token, userData: parsedUserData, reason: null };
  } catch (error) {
    console.error("Error parsing SuperAdmin user data:", error);
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_user");
    return { isValid: false, token: null, userData: null, reason: 'parse_error' };
  }
};

/**
 * Get error message based on validation reason
 * @param {string} reason - Validation failure reason
 * @returns {string} - User-friendly error message
 */
export const getSessionErrorMessage = (reason) => {
  switch (reason) {
    case 'expired':
      return 'Session expired. Please log in again.';
    case 'invalid_role':
      return 'Access denied. SuperAdmin privileges required.';
    case 'parse_error':
      return 'Invalid session data. Please log in again.';
    default:
      return 'Please log in to continue.';
  }
};
