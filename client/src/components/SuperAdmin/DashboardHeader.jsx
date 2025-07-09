import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  AdminPanelSettings,
  Notifications,
  Settings,
} from '@mui/icons-material';

const DashboardHeader = ({ onMenuClick, onLogout, activeTab, user }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, sm: 3 } }}>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AdminPanelSettings sx={{ mr: 1.5, fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.2,
              }}
            >
              SuperAdmin Portal
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {activeTab}
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* System Status */}
          <Chip
            icon={<AdminPanelSettings />}
            label="System Active"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.2),
              color: 'white',
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              display: { xs: 'none', md: 'flex' }
            }}
          />

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" size="small">
              <Notifications />
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton color="inherit" size="small">
              <Settings />
            </IconButton>
          </Tooltip>

          {/* User Avatar & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              SA
            </Avatar>
            
            <Tooltip title="Logout SuperAdmin">
              <IconButton
                color="inherit"
                onClick={onLogout}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.3),
                  },
                }}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
