import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  Badge,
  Button,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Login,
  Logout,
  PersonAdd,
  Edit,
  Warning,
  CheckCircle,
  Error,
  Info,
  Timeline,
  Today,
  Schedule,
  Security,
  Flag,
  Visibility,
  GetApp,
  Description,
  Block,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const ActivityCard = ({ title, count, icon, color, subtitle }) => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color }}>
            {icon}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {count}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ activity, showDetails = false, onFlag }) => {
  const theme = useTheme();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <Login fontSize="small" />;
      case 'logout':
        return <Logout fontSize="small" />;
      case 'password_change':
        return <Security fontSize="small" />;
      case 'profile_update':
        return <Edit fontSize="small" />;
      case 'job_view':
        return <Visibility fontSize="small" />;
      case 'job_update':
        return <Edit fontSize="small" />;
      case 'document_upload':
        return <GetApp fontSize="small" />;
      case 'document_download':
        return <Description fontSize="small" />;
      case 'failed_login':
        return <Error fontSize="small" />;
      case 'unauthorized_access':
        return <Warning fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
        return theme.palette.success.main;
      case 'logout':
        return theme.palette.warning.main;
      case 'password_change':
        return theme.palette.info.main;
      case 'profile_update':
        return theme.palette.primary.main;
      case 'job_view':
        return theme.palette.grey[600];
      case 'job_update':
        return theme.palette.primary.main;
      case 'document_upload':
        return theme.palette.success.main;
      case 'document_download':
        return theme.palette.info.main;
      case 'failed_login':
        return theme.palette.error.main;
      case 'unauthorized_access':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    return `${location.city || 'Unknown'}, ${location.state || ''}, ${location.country || 'Unknown'}`.replace(', ,', ',');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 2, position: 'relative' }}>
      <Avatar
        sx={{
          bgcolor: alpha(getActivityColor(activity.activity_type), 0.1),
          color: getActivityColor(activity.activity_type),
          mr: 2,
          width: 40,
          height: 40,
        }}
      >
        {getActivityIcon(activity.activity_type)}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {activity.description}
          </Typography>
          {activity.is_suspicious && (
            <Badge color="error" variant="dot">
              <Flag fontSize="small" color="error" />
            </Badge>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {activity.user_name} ({activity.ie_code_no}) • {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
          </Typography>
          <Chip
            label={activity.severity}
            size="small"
            color={getSeverityColor(activity.severity)}
            variant="outlined"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          IP: {activity.ip_address} • Location: {formatLocation(activity.location)}
        </Typography>
        {showDetails && activity.details && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details, null, 2)}
          </Typography>
        )}
        {activity.admin_notes && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
            Admin Notes: {activity.admin_notes}
          </Typography>
        )}
      </Box>
      {!activity.is_suspicious && onFlag && (
        <Tooltip title="Flag as suspicious">
          <IconButton
            size="small"
            onClick={() => onFlag(activity._id)}
            sx={{ 
              opacity: 0.6,
              '&:hover': { opacity: 1, color: 'error.main' }
            }}
          >
            <Flag fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const UserActivity = ({ data, onRefresh }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Helper function to get SuperAdmin headers
  const getSuperAdminHeaders = () => {
    const token = localStorage.getItem("superadmin_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };
  };

  // Fetch recent activities
  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filterType !== 'all') params.append('activity_type', filterType);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);

      const response = await axios.get(
        `${process.env.REACT_APP_API_STRING}/activity/recent?${params}`,
        getSuperAdminHeaders()
      );

      if (response.data.success) {
        setActivities(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_STRING}/activity/stats?days=7`,
        getSuperAdminHeaders()
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_STRING}/activity/sessions`,
        getSuperAdminHeaders()
      );

      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  // Fetch suspicious activities
  const fetchSuspiciousActivities = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_STRING}/activity/suspicious?limit=10`,
        getSuperAdminHeaders()
      );

      if (response.data.success) {
        setSuspiciousActivities(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching suspicious activities:', err);
    }
  };

  // Flag activity as suspicious
  const flagActivity = async (activityId, notes = 'Flagged by admin') => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_STRING}/activity/${activityId}/flag`,
        { admin_notes: notes },
        getSuperAdminHeaders()
      );
      
      // Refresh activities
      fetchActivities(pagination.currentPage);
      fetchSuspiciousActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Error flagging activity');
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchActivities();
    fetchStats();
    fetchSessions();
    fetchSuspiciousActivities();
  }, [filterType, filterSeverity]);

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities(pagination.currentPage);
    fetchStats();
    fetchSessions();
    fetchSuspiciousActivities();
    if (onRefresh) onRefresh();
  };

  // Handle pagination
  const handlePageChange = (event, page) => {
    fetchActivities(page);
  };

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity => 
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.ie_code_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'idle':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Generate activity stats from real data
  const activityStats = [
    {
      title: 'Total Activities',
      count: stats.overview?.total_activities?.toLocaleString() || '0',
      icon: <Timeline />,
      color: theme.palette.primary.main,
      subtitle: 'Last 7 days',
    },
    {
      title: 'Active Users',
      count: stats.overview?.active_users?.toString() || '0',
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      subtitle: 'Unique users',
    },
    {
      title: 'Failed Logins',
      count: stats.overview?.failed_logins?.toString() || '0',
      icon: <Error />,
      color: theme.palette.error.main,
      subtitle: 'Security alerts',
    },
    {
      title: 'Suspicious Activities',
      count: stats.overview?.suspicious_activities?.toString() || '0',
      icon: <Warning />,
      color: theme.palette.warning.main,
      subtitle: 'Flagged events',
    },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    switch (activeTab) {
      case 0:
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="logout">Logout</MenuItem>
                  <MenuItem value="failed_login">Failed Login</MenuItem>
                  <MenuItem value="password_change">Password Change</MenuItem>
                  <MenuItem value="job_view">Job View</MenuItem>
                  <MenuItem value="job_update">Job Update</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {filteredActivities.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No activities found
              </Typography>
            ) : (
              <>
                <Box>
                  {filteredActivities.map((activity, index) => (
                    <Box key={activity._id}>
                      <ActivityItem 
                        activity={activity} 
                        showDetails 
                        onFlag={flagActivity}
                      />
                      {index < filteredActivities.length - 1 && <Divider sx={{ ml: 7 }} />}
                    </Box>
                  ))}
                </Box>
                
                {pagination.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        );
        
      case 1:
        return (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Login Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Activity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Device Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No active sessions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {session.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {session.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.user.ie_code_no}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(session.login_time), 'MMM dd, HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(session.last_activity), 'MMM dd, HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.location ? `${session.location.city}, ${session.location.country}` : 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {session.device}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
              Suspicious Activities
            </Typography>
            {suspiciousActivities.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No suspicious activities found
              </Typography>
            ) : (
              <Box>
                {suspiciousActivities.map((activity, index) => (
                  <Box key={activity._id}>
                    <ActivityItem activity={activity} showDetails />
                    {index < suspiciousActivities.length - 1 && <Divider sx={{ ml: 7 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Customer Activity Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor customer activities, sessions, and security events in real-time.
          </Typography>
        </Box>
        <IconButton
          onClick={handleRefresh}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {activityStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ActivityCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ px: 3 }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Activity Feed
                    {activities.length > 0 && (
                      <Chip size="small" label={activities.length} />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Active Sessions
                    {sessions.length > 0 && (
                      <Chip size="small" label={sessions.length} color="success" />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Suspicious
                    {suspiciousActivities.length > 0 && (
                      <Chip size="small" label={suspiciousActivities.length} color="error" />
                    )}
                  </Box>
                } 
              />
            </Tabs>
          </Box>
          <Box sx={{ p: 3 }}>
            {renderTabContent()}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserActivity;
