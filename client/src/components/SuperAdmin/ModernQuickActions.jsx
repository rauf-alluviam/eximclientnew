import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Stack,
  alpha
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Extension as ExtensionIcon,
  Analytics as AnalyticsIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const ModernQuickActions = ({ colors, onAction }) => {
  const quickActions = [
    {
      id: 'add_customer',
      label: 'Add Customer',
      icon: PersonAddIcon,
      color: colors.primary,
      description: 'Register new customer'
    },
    {
      id: 'manage_modules',
      label: 'Manage Modules',
      icon: ExtensionIcon,
      color: colors.success,
      description: 'Configure module access'
    },
    {
      id: 'view_analytics',
      label: 'View Analytics',
      icon: AnalyticsIcon,
      color: colors.warning,
      description: 'System performance metrics'
    },
    {
      id: 'export_data',
      label: 'Export Data',
      icon: ExportIcon,
      color: colors.info,
      description: 'Download reports'
    },
    {
      id: 'system_settings',
      label: 'System Settings',
      icon: SettingsIcon,
      color: colors.secondary,
      description: 'Configure system'
    },
    {
      id: 'security_audit',
      label: 'Security Audit',
      icon: SecurityIcon,
      color: colors.error,
      description: 'Review security logs'
    }
  ];

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${alpha(colors.text.secondary, 0.1)}`
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: colors.text.primary,
              fontSize: '1rem',
              mb: 0.5
            }}
          >
            Quick Actions
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: colors.text.secondary,
              fontSize: '0.75rem'
            }}
          >
            Common administrative tasks
          </Typography>
        </Box>
        
        {/* Actions */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.id}
                  fullWidth
                  variant="outlined"
                  startIcon={<Icon sx={{ fontSize: '1.1rem' }} />}
                  onClick={() => onAction && onAction(action.id)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    borderColor: alpha(action.color, 0.2),
                    color: action.color,
                    backgroundColor: alpha(action.color, 0.02),
                    '&:hover': {
                      borderColor: alpha(action.color, 0.4),
                      backgroundColor: alpha(action.color, 0.08),
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: action.color
                      }}
                    >
                      {action.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: colors.text.secondary,
                        display: 'block',
                        lineHeight: 1.2
                      }}
                    >
                      {action.description}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Box>
        
        {/* Footer */}
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(colors.text.secondary, 0.1)}`,
          textAlign: 'center'
        }}>
          <Button 
            size="small" 
            startIcon={<RefreshIcon />}
            sx={{ 
              fontSize: '0.75rem',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.1)
              }
            }}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModernQuickActions;
