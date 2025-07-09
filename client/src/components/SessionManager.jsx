import React, { useEffect, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAutoLogout, useSessionWarning } from '../hooks/useAutoLogout';
import { UserContext } from '../context/UserContext';

/**
 * Session Manager Component
 * Handles automatic logout and session warnings for the entire application
 */
const SessionManager = ({ userType = 'user' }) => {
  const { user } = useContext(UserContext);
  const [logoutMessage, setLogoutMessage] = useState(null);
  
  const { handleLogout } = useAutoLogout(userType, () => {
    setLogoutMessage('Your session has expired. Please log in again.');
  });
  
  const { warningState, dismissWarning } = useSessionWarning(userType);

  // Only render if user is logged in
  if (!user && userType === 'user') {
    return null;
  }

  // For SuperAdmin, check localStorage
  if (userType === 'superadmin' && !localStorage.getItem("superadmin_token")) {
    return null;
  }

  return (
    <>
      {/* Session Expiration Warning */}
      {warningState && (
        <Alert 
          severity="warning" 
          onClose={dismissWarning}
          sx={{ 
            position: 'fixed', 
            top: 80, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300
          }}
        >
          {warningState.message}
        </Alert>
      )}

      {/* Logout Notification */}
      <Snackbar
        open={!!logoutMessage}
        autoHideDuration={3000}
        onClose={() => setLogoutMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          onClose={() => setLogoutMessage(null)}
        >
          {logoutMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SessionManager;
