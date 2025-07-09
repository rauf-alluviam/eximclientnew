import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  alpha,
  Skeleton,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  Assessment,
  TrendingUp,
  Security,
  Refresh,
  PersonAdd,
  Analytics,
  Timeline,
  TrendingDown,
  NotificationsActive,
  Dashboard,
  ShowChart,
  VerifiedUser,
  Speed,
  Insights,
  CloudDone,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

// Compact theme configuration
const theme = {
  palette: {
    primary: { main: '#667eea', dark: '#5a6fd8' },
    secondary: { main: '#764ba2', dark: '#6a4190' },
    success: { main: '#4caf50', dark: '#45a049' },
    warning: { main: '#ff9800', dark: '#f57c00' },
    error: { main: '#f44336', dark: '#d32f2f' },
    info: { main: '#2196f3', dark: '#1976d2' },
    background: { paper: '#ffffff', default: '#f8fafc' },
    text: { primary: '#1a202c', secondary: '#718096' },
  },
  spacing: {
    compact: 8,
    normal: 12,
    large: 16,
  },
  typography: {
    sectionHeading: { fontSize: '1.25rem', fontWeight: 600 },
    subHeading: { fontSize: '0.95rem', fontWeight: 500 },
    body: { fontSize: '0.85rem', fontWeight: 400 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
  },
};

const StatsCard = ({ title, value, icon, color, trend, loading, subtitle, progress }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <Card sx={{ 
        height: '140px', 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <CardContent sx={{ p: 1.5 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" sx={{ mt: 1, fontSize: '1.25rem' }} />
          <Skeleton variant="text" width="80%" sx={{ fontSize: '0.85rem' }} />
          <Skeleton variant="rectangular" height={4} sx={{ mt: 1, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const isPositiveTrend = trend > 0;

  return (
    <Card
      sx={{
        height: '140px',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.85)} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? `0 8px 20px ${alpha(color, 0.25)}` 
          : `0 2px 8px ${alpha(color, 0.15)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${alpha('#ffffff', 0.15)} 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(20px, -20px)',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 1.5, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 0.5, 
              fontSize: '1.5rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em' 
            }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.95, 
              fontWeight: 500, 
              mb: 0.5,
              fontSize: '0.85rem',
              lineHeight: 1.3,
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ 
                opacity: 0.8, 
                display: 'block',
                fontSize: '0.7rem',
                lineHeight: 1.2,
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: alpha('#ffffff', 0.25),
              borderRadius: 1.5,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: '1.2rem' } })}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip
            icon={isPositiveTrend ? <TrendingUp sx={{ fontSize: '0.8rem' }} /> : <TrendingDown sx={{ fontSize: '0.8rem' }} />}
            label={`${Math.abs(trend)}%`}
            size="small"
            sx={{
              bgcolor: alpha('#ffffff', 0.2),
              color: 'white',
              fontWeight: 500,
              fontSize: '0.7rem',
              height: '20px',
              '& .MuiChip-icon': {
                color: isPositiveTrend ? '#4caf50' : '#f44336',
              },
            }}
          />
          <Typography variant="caption" sx={{ 
            opacity: 0.9,
            fontSize: '0.65rem',
          }}>
            vs last week
          </Typography>
        </Box>

        {progress !== undefined && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha('#ffffff', 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ title, data, loading, type = 'line' }) => {
  if (loading) {
    return (
      <Card sx={{ 
        height: '280px', 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <CardContent sx={{ p: 1.5 }}>
          <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 1 }} />
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Completed', value: 65, color: '#4caf50' },
    { name: 'Pending', value: 25, color: '#ff9800' },
    { name: 'Rejected', value: 10, color: '#f44336' },
  ];

  return (
    <Card sx={{ 
      height: '280px', 
      borderRadius: 2, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip 
              label="Live" 
              size="small" 
              color="success" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                width: '28px',
                height: '28px',
              }}
            >
              <ShowChart sx={{ fontSize: '1rem', color: theme.palette.primary.main }} />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ height: '220px', flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    fontSize: '0.8rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{
                    fontSize: '0.8rem',
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    fontSize: '0.8rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const QuickActionCard = ({ title, icon, color, onClick, badge }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: `1px solid ${alpha(color, 0.15)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? `0 4px 12px ${alpha(color, 0.15)}` 
          : `0 1px 4px ${alpha(color, 0.08)}`,
        '&:hover': {
          borderColor: alpha(color, 0.25),
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Badge badgeContent={badge} color="error">
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 36,
              height: 36,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: '1rem' } })}
          </Avatar>
        </Badge>
        <Typography variant="body2" sx={{ 
          fontWeight: 500, 
          color: theme.palette.text.primary,
          fontSize: '0.85rem',
        }}>
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

// Section Header Component
const SectionHeader = ({ title, subtitle, action }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    mb: 1.5,
    px: 0.5,
  }}>
    <Box>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: theme.palette.text.primary,
        fontSize: '1.1rem',
        mb: subtitle ? 0.25 : 0,
      }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ 
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
        }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && action}
  </Box>
);

// Density Mode Hook
const useDensityMode = () => {
  const [densityMode, setDensityMode] = useState('compact'); // 'compact' | 'comfortable'
  
  const toggleDensity = () => {
    setDensityMode(prev => prev === 'compact' ? 'comfortable' : 'compact');
  };
  
  return { densityMode, toggleDensity };
};

const DashboardOverview = ({ data, onRefresh, loading = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { densityMode, toggleDensity } = useDensityMode();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced mock data
  const mockChartData = [
    { name: 'Mon', value: 45, users: 120 },
    { name: 'Tue', value: 52, users: 145 },
    { name: 'Wed', value: 38, users: 98 },
    { name: 'Thu', value: 61, users: 167 },
    { name: 'Fri', value: 55, users: 134 },
    { name: 'Sat', value: 42, users: 98 },
    { name: 'Sun', value: 48, users: 112 },
  ];

  const stats = [
    {
      title: 'Total Customers',
      value: data?.totalCustomers?.toLocaleString() || '0',
      icon: <People sx={{ fontSize: '1.2rem' }} />,
      color: theme.palette.primary.main,
      trend: data?.users?.growthTrend || 0,
      subtitle: `${data?.users?.newRegistrations || 0} new this month`,
      progress: 75,
    },
    {
      title: 'KYC Verified',
      value: data?.kycRecords?.toLocaleString() || '0',
      icon: <VerifiedUser sx={{ fontSize: '1.2rem' }} />,
      color: theme.palette.success.main,
      trend: data?.totalCustomers ? ((data?.kycRecords / data?.totalCustomers) * 100).toFixed(1) : 0,
      subtitle: `${data?.totalCustomers ? Math.round((data?.kycRecords / data?.totalCustomers) * 100) : 0}% completion rate`,
      progress: data?.totalCustomers ? Math.round((data?.kycRecords / data?.totalCustomers) * 100) : 0,
    },
    {
      title: 'Active Sessions',
      value: data?.activeSessions?.toLocaleString() || '0',
      icon: <Timeline sx={{ fontSize: '1.2rem' }} />,
      color: theme.palette.info.main,
      trend: data?.activity?.trend || 0,
      subtitle: 'Today\'s active sessions',
      progress: data?.users?.total ? Math.round((data?.activeSessions / data?.users?.total) * 100) : 0,
    },
    {
      title: 'System Health',
      value: `${data?.system?.uptimePercent || 99.9}%`,
      icon: <Speed sx={{ fontSize: '1.2rem' }} />,
      color: theme.palette.warning.main,
      trend: 0.12,
      subtitle: 'All systems operational',
      progress: data?.system?.uptimePercent || 99.9,
    },
  ];

  const quickActions = [
    { title: 'Add Customer', icon: <PersonAdd />, color: theme.palette.primary.main, badge: null },
    { title: 'View Reports', icon: <Analytics />, color: theme.palette.secondary.main, badge: 3 },
    { title: 'System Check', icon: <Security />, color: theme.palette.success.main, badge: null },
    { title: 'Notifications', icon: <NotificationsActive />, color: theme.palette.error.main, badge: 12 },
  ];

  const recentActivities = [
    { action: 'New customer registration', time: '2 minutes ago', status: 'success' },
    { action: 'KYC verification completed', time: '5 minutes ago', status: 'success' },
    { action: 'System maintenance scheduled', time: '1 hour ago', status: 'warning' },
    { action: 'Security audit completed', time: '3 hours ago', status: 'info' },
  ];

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: densityMode === 'compact' ? 2 : 3,
    }}>
      {/* Compact Header */}
      <Paper
        elevation={0}
        sx={{
          p: densityMode === 'compact' ? 2.5 : 3,
          borderRadius: 2,
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 0.5, 
                fontSize: densityMode === 'compact' ? '1.5rem' : '2rem',
                letterSpacing: '-0.01em' 
              }}>
                Dashboard Overview
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                opacity: 0.9, 
                mb: 1.5, 
                fontWeight: 400,
                fontSize: densityMode === 'compact' ? '0.9rem' : '1rem',
              }}>
                Welcome back, SuperAdmin. Here's what's happening today.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CloudDone sx={{ fontSize: '0.9rem' }} />}
                  label="All Systems Online"
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.2), 
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '24px',
                  }}
                />
                <Chip
                  icon={<CheckCircle sx={{ fontSize: '0.9rem' }} />}
                  label="Last Updated: Just now"
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.2), 
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '24px',
                  }}
                />
                <Typography variant="caption" sx={{ 
                  opacity: 0.8,
                  fontSize: '0.7rem',
                }}>
                  {currentTime.toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={`Switch to ${densityMode === 'compact' ? 'Comfortable' : 'Compact'} View`}>
                <IconButton
                  onClick={toggleDensity}
                  size="small"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.3),
                    },
                  }}
                >
                  <Dashboard sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={onRefresh}
                  size="small"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.3),
                    },
                  }}
                >
                  <Refresh sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* System Overview Section */}
      <SectionHeader 
        title="System Overview" 
        subtitle="Key performance indicators and metrics"
      />
      
      {/* KPI Cards in 4-column responsive grid */}
      <Grid container spacing={densityMode === 'compact' ? 1.5 : 2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatsCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Analytics Section */}
      <SectionHeader 
        title="Analytics" 
        subtitle="Real-time data visualization and trends"
      />
      
      {/* Charts in structured rows */}
      <Grid container spacing={densityMode === 'compact' ? 1.5 : 2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="User Activity Trends"
            data={mockChartData}
            loading={loading}
            type="area"
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="KYC Status Distribution"
            data={mockChartData}
            loading={loading}
            type="pie"
          />
        </Grid>
      </Grid>

      {/* Activity & Actions Section */}
      <SectionHeader 
        title="Activity & Quick Actions" 
        subtitle="Recent events and frequently used operations"
      />
      
      {/* Activity and Quick Actions in structured grid */}
      <Grid container spacing={densityMode === 'compact' ? 1.5 : 2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <CardContent sx={{ p: densityMode === 'compact' ? 1.5 : 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1.5, 
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
              }}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentActivities.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    p: 1.5, 
                    bgcolor: alpha(theme.palette.primary.main, 0.02), 
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}>
                    <Avatar sx={{ 
                      bgcolor: item.status === 'success' ? theme.palette.success.main : 
                               item.status === 'warning' ? theme.palette.warning.main : 
                               theme.palette.info.main,
                      width: 28,
                      height: 28,
                    }}>
                      {item.status === 'success' ? <CheckCircle sx={{ fontSize: '0.9rem' }} /> : 
                       item.status === 'warning' ? <Warning sx={{ fontSize: '0.9rem' }} /> : 
                       <Insights sx={{ fontSize: '0.9rem' }} />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        lineHeight: 1.3,
                      }}>
                        {item.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{
                        fontSize: '0.7rem',
                      }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <CardContent sx={{ p: densityMode === 'compact' ? 1.5 : 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1.5, 
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
              }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickActions.map((action, index) => (
                  <QuickActionCard
                    key={index}
                    {...action}
                    onClick={() => console.log(`${action.title} clicked`)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;