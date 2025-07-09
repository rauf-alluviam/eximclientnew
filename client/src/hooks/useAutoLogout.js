import { useEffect, useContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { validateUserToken, validateSuperAdminToken, getTokenExpirationStatus } from '../utils/tokenValidation';
import { tokenService } from '../utils/TokenService';
import { tokenValidationManager } from '../utils/TokenValidationManager';

/**
 * Custom hook for handling automatic logout on token expiry
 * @param {string} userType - 'user' or 'superadmin' 
 * @param {function} onTokenExpiry - Optional callback when token expires
 * @returns {object} - Logout function and warning state
 */
export const useAutoLogout = (userType = 'user', onTokenExpiry = null) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = useCallback(async (silent = false) => {
    try {
      if (userType === 'superadmin') {
        // For SuperAdmin, call logout API to update logout time
        try {
          const superAdminUser = localStorage.getItem("superadmin_user");
          
          if (superAdminUser) {
            const userData = JSON.parse(superAdminUser);
            
            await axios.post(
              `${process.env.REACT_APP_API_STRING}/superadmin/logout`,
              { userId: userData.id },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        } catch (error) {
          console.error('Error calling SuperAdmin logout API:', error);
        }
        
        localStorage.removeItem("superadmin_token");
        localStorage.removeItem("superadmin_user");
        if (!silent) {
          console.log('SuperAdmin logged out due to token expiry');
        }
        navigate("/superadmin-login");
      } else {
        // For regular users, call the logout API to clear cookies and update logout time
        try {
          const logoutData = {};
          
          // Include user ID if available for logout time tracking
          if (user?.id) {
            logoutData.user_id = user.id;
          }
          
          await axios.post(
            `${process.env.REACT_APP_API_STRING}/logout`,
            logoutData,
            { withCredentials: true }
          );
        } catch (error) {
          console.error('Error calling logout API:', error);
        }
        
        localStorage.removeItem("exim_user");
        setUser(null);
        
        if (!silent) {
          console.log('User logged out due to token expiry');
        }
        navigate("/login");
      }
      
      if (onTokenExpiry) {
        onTokenExpiry();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [navigate, user, setUser, userType, onTokenExpiry]);

  useEffect(() => {
    let interceptorId;

    // Initialize the global token validation manager
    tokenValidationManager.init();

    // Subscribe to centralized token validation
    const unsubscribe = tokenService.subscribe(() => {
      handleLogout(true);
    });

    // Set up axios interceptor to handle 401/403 responses
    interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('API returned authentication error. Logging out...');
          tokenService.invalidateCache(); // Clear cache on auth error
          handleLogout(true);
        }
        return Promise.reject(error);
      }
    );

    // Initial check
    tokenService.validateToken(userType);

    // Cleanup on unmount
    return () => {
      if (interceptorId) {
        axios.interceptors.response.eject(interceptorId);
      }
      unsubscribe();
    };
  }, [handleLogout, userType]);

  return { handleLogout };
};

/**
 * Custom hook for showing session expiration warnings
 * @param {string} userType - 'user' or 'superadmin'
 * @returns {object} - Warning state and dismiss function
 */
export const useSessionWarning = (userType = 'user') => {
  const [warningState, setWarningState] = useState(null);

  useEffect(() => {
    let warningInterval;

    const checkForExpirationWarning = () => {
      if (userType === 'superadmin') {
        const token = localStorage.getItem("superadmin_token");
        if (token) {
          const expirationStatus = getTokenExpirationStatus(token, 30);
          
          if (expirationStatus.isExpiringSoon && !warningState) {
            setWarningState({
              message: `Your session will expire in ${expirationStatus.timeRemainingFormatted}. Please save your work.`,
              timeRemaining: expirationStatus.timeRemaining
            });
          } else if (!expirationStatus.isExpiringSoon && warningState) {
            setWarningState(null);
          }
        }
      } else {
        // For regular users, we can't easily check JWT expiration from cookies
        // So we'll rely on the API validation in the main auto-logout hook
        // For now, just clear any existing warning
        if (warningState) {
          setWarningState(null);
        }
      }
    };

    // Check for warnings every 60 seconds
    warningInterval = setInterval(checkForExpirationWarning, 60000);

    // Initial check
    checkForExpirationWarning();

    return () => {
      if (warningInterval) {
        clearInterval(warningInterval);
      }
    };
  }, [userType, warningState]);

  const dismissWarning = useCallback(() => {
    setWarningState(null);
  }, []);

  return { warningState, dismissWarning };
};
