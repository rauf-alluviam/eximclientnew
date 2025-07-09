import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  alpha
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon 
} from '@mui/icons-material';

const ModernStatsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color, 
  gradient,
  colors 
}) => {
  const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: gradient,
        color: colors.surface,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          height: '100%'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.85,
                fontSize: '0.75rem',
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendIcon sx={{ fontSize: '1rem', opacity: 0.8 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  fontWeight: 600
                }}
              >
                {change}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  ml: 0.5
                }}
              >
                vs last month
              </Typography>
            </Box>
          </Box>
          
          <Avatar 
            sx={{ 
              backgroundColor: alpha(colors.surface, 0.2),
              width: 48,
              height: 48,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Icon sx={{ color: colors.surface, fontSize: '1.5rem' }} />
          </Avatar>
        </Box>
        
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: alpha(colors.surface, 0.1),
            zIndex: 0
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ModernStatsCard;
