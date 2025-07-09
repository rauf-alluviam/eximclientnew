import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton, 
  Badge,
  Tooltip,
  alpha
} from '@mui/material';
import { 
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const ModernHeader = ({ title, onLogout, colors }) => {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${alpha(colors.text.secondary, 0.1)}`,
        color: colors.text.primary
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              background: colors.gradients.primary,
              width: 40,
              height: 40,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            SA
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.2,
                color: colors.text.primary
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              Administrative Panel
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton 
              size="small"
              sx={{ 
                color: colors.text.secondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.1) }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton 
              size="small"
              sx={{ 
                color: colors.text.secondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.1) }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton 
              size="small"
              onClick={onLogout}
              sx={{ 
                color: colors.text.secondary,
                '&:hover': { backgroundColor: alpha(colors.error, 0.1) }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ModernHeader;
