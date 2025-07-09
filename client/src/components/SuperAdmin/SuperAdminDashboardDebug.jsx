// Debug SuperAdmin Dashboard to troubleshoot routing issues
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { validateSuperAdminToken } from "../utils/tokenValidation";

const SuperAdminDashboardDebug = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debugInfo, setDebugInfo] = useState({});
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const debug = async () => {
      console.log('🔍 SuperAdmin Dashboard Debug Starting...');
      
      // Check localStorage
      const token = localStorage.getItem("superadmin_token");
      const user = localStorage.getItem("superadmin_user");
      
      console.log('📋 Token exists:', !!token);
      console.log('📋 User exists:', !!user);
      
      if (token) {
        console.log('🔑 Token (first 20 chars):', token.substring(0, 20));
      }
      
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          console.log('👤 User data:', parsedUser);
        } catch (e) {
          console.log('❌ Error parsing user:', e);
        }
      }
      
      // Check validation
      const validation = validateSuperAdminToken();
      console.log('✅ Validation result:', validation);
      
      setDebugInfo({
        pathname: location.pathname,
        hasToken: !!token,
        hasUser: !!user,
        validation: validation,
        timestamp: new Date().toISOString()
      });
      
      if (!validation.isValid) {
        console.log('❌ Validation failed, redirecting in 3 seconds...');
        setTimeout(() => {
          navigate("/superadmin-login");
        }, 3000);
      } else {
        console.log('✅ Validation passed, staying on dashboard');
        setIsAuthenticating(false);
      }
    };
    
    debug();
  }, [navigate, location.pathname]);

  if (isAuthenticating) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            SuperAdmin Dashboard - Debug Mode
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Authenticating... Please wait.
          </Alert>
          
          <Typography variant="h6" gutterBottom>Debug Information:</Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          SuperAdmin Dashboard - Debug Mode
        </Typography>
        
        <Alert severity="success" sx={{ mb: 2 }}>
          Authentication successful! Dashboard is loading.
        </Alert>
        
        <Typography variant="h6" gutterBottom>Debug Information:</Typography>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default SuperAdminDashboardDebug;
