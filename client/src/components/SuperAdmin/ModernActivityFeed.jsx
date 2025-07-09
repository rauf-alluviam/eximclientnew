import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  Chip,
  Button,
  alpha
} from '@mui/material';
import { 
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Error as ErrorIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const ModernActivityFeed = ({ activities, colors, maxItems = 8 }) => {
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'login':
        return LoginIcon;
      case 'logout':
        return LogoutIcon;
      case 'failed_login':
        return ErrorIcon;
      case 'module_access':
        return SecurityIcon;
      default:
        return PersonIcon;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'login':
        return colors.success;
      case 'logout':
        return colors.info;
      case 'failed_login':
        return colors.error;
      case 'module_access':
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 3,
          borderBottom: `1px solid ${alpha(colors.text.secondary, 0.1)}`
        }}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: colors.text.primary,
                fontSize: '1rem',
                mb: 0.5
              }}
            >
              Recent Activity
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              Last 24 hours
            </Typography>
          </Box>
          <Button 
            size="small" 
            startIcon={<FilterListIcon />}
            sx={{ 
              fontSize: '0.75rem',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.1)
              }
            }}
          >
            Filter
          </Button>
        </Box>
        
        {/* Activity List */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {activities?.slice(0, maxItems).map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.activity_type);
            const activityColor = getActivityColor(activity.activity_type);
            
            return (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderBottom: index < activities.length - 1 ? `1px solid ${alpha(colors.text.secondary, 0.05)}` : 'none',
                  '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.02)
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36,
                    height: 36,
                    backgroundColor: alpha(activityColor, 0.1),
                    color: activityColor
                  }}
                >
                  <ActivityIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      color: colors.text.primary,
                      mb: 0.5
                    }}
                  >
                    {activity.user_name || 'Unknown User'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontSize: '0.75rem',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {activity.description}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip 
                    label={activity.activity_type.replace('_', ' ')}
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      backgroundColor: alpha(activityColor, 0.1),
                      color: activityColor,
                      border: 'none',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.text.secondary,
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatTime(activity.timestamp)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        
        {/* Footer */}
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(colors.text.secondary, 0.1)}`,
          textAlign: 'center'
        }}>
          <Button 
            size="small" 
            sx={{ 
              fontSize: '0.75rem',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.1)
              }
            }}
          >
            View All Activity
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModernActivityFeed;
