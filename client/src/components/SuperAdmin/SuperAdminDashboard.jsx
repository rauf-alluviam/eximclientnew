import React, { useState, useContext, useEffect } from "react";
import { Box, Container, useTheme, alpha, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { validateSuperAdminToken } from "../../utils/tokenValidation";
import { useAutoLogout } from "../../hooks/useAutoLogout";

// Import dashboard components
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardOverview from './DashboardOverview';
import CustomerManagement from './CustomerManagement';
import ModuleManagement from './ModuleManagement';
import SystemAnalytics from './SystemAnalytics';
import UserActivity from './UserActivity';
import LoadingScreen from './LoadingScreen';
import ModuleAccessManagement from '../../pages/ModuleAccessManagement';
import SessionManager from '../SessionManager';
import ColumnPermissionsManagement from './ColumnPermissionsManagement';

// Import custom hook
import { useSuperAdminApi } from '../../hooks/useSuperAdminApi';

const SuperAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  // Use custom hook for API calls
  const { 
    loading, 
    error, 
    setError,
    getDashboardAnalytics, 
    getUserActivity 
  } = useSuperAdminApi();

  // Use auto-logout hook
  const { handleLogout: autoLogout } = useAutoLogout('superadmin');

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Tab configuration
  const tabs = [
    { label: 'Overview', icon: 'dashboard', component: 'overview' },
    { label: 'Customer Management', icon: 'people', component: 'customers' },
    { label: 'Module Management', icon: 'settings', component: 'modules' },
    { label: 'Column Permissions', icon: 'visibility', component: 'columns' },
    { label: 'System Analytics', icon: 'analytics', component: 'analytics' },
    { label: 'User Activity', icon: 'timeline', component: 'activity' },
    { label: 'Session Manager', icon: 'security', component: 'sessions' }
  ];

  // Authentication check
  useEffect(() => {
    const checkSuperAdminAuth = async () => {
      const validation = validateSuperAdminToken();
      
      if (!validation.isValid) {
        navigate("/superadmin-login");
        return;
      }
      
      setIsAuthenticating(false);
      await fetchDashboardData();
    };
    
    checkSuperAdminAuth();
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [analyticsData, activityData] = await Promise.all([
        getDashboardAnalytics(),
        getUserActivity('active', 5)
      ]);
      
      setDashboardData(analyticsData.data);
      setUserActivity(activityData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/superadmin-login");
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Get SuperAdmin user data from localStorage
      const superAdminUser = localStorage.getItem("superadmin_user");
      
      if (superAdminUser) {
        try {
          const userData = JSON.parse(superAdminUser);
          
          // Call logout API to update logout time
          await fetch(`${process.env.REACT_APP_API_STRING}/superadmin/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userData.id }),
          });
        } catch (error) {
          console.error('Error calling SuperAdmin logout API:', error);
        }
      }
      
      // Clear localStorage and redirect
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      navigate("/superadmin-login");
    } catch (error) {
      console.error('Error during SuperAdmin logout:', error);
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      navigate("/superadmin-login");
    }
  };

  // Loading screen
  if (isAuthenticating || loading) {
    return <LoadingScreen />;
  }

  // Render active component
  const renderActiveComponent = () => {
    switch (tabs[activeTab].component) {
      case 'overview':
        return <DashboardOverview data={dashboardData} onRefresh={fetchDashboardData} />;
      case 'customers':
        return <CustomerManagement onRefresh={fetchDashboardData} />;
      case 'modules':
        return <ModuleManagement onRefresh={fetchDashboardData} />;
      case 'columns':
        return <ColumnPermissionsManagement onRefresh={fetchDashboardData} />;
      case 'analytics':
        return <SystemAnalytics data={dashboardData} />;
      case 'activity':
        return <UserActivity data={userActivity} onRefresh={fetchDashboardData} />;
      case 'sessions':
        return <SessionManager userType="superadmin" />;
      default:
        return <DashboardOverview data={dashboardData} onRefresh={fetchDashboardData} />;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: alpha(theme.palette.grey[50], 0.5),
      position: 'relative'
    }}>
      {/* Session Manager for SuperAdmin */}
      <SessionManager userType="superadmin" />
      
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: sidebarOpen ? 0 : `-280px`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          activeTab={tabs[activeTab].label}
          user={user}
        />

        {/* Content Area */}
        <Container
          maxWidth={false}
          sx={{
            flexGrow: 1,
            pt: 3,
            pb: 3,
            px: { xs: 2, sm: 3 }
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {renderActiveComponent()}
        </Container>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
