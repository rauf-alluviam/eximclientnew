import Customer from '../models/customerModel.js';
import CustomerKyc from '../models/customerKycModel.js';
import Job from '../models/jobModel.js';
import { protectSuperAdmin } from './superAdminController.js';

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total customers from customerKyc collection
    const totalCustomers = await CustomerKyc.countDocuments();
    
    // Get KYC verified customers (approval = 'Approved')
    const kycVerified = await CustomerKyc.countDocuments({ approval: 'Approved' });
    
    // Get active sessions (customers with lastLogin today)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const activeSessions = await Customer.countDocuments({
      lastLogin: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    // Get additional customer stats for trends
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    const inactiveCustomers = await Customer.countDocuments({ isActive: false });
    
    // Get customers with recent login activity (for trend calculation)
    const recentLogins = await Customer.countDocuments({
      lastLogin: { $gte: startDate }
    });
    
    // Get new registrations in the time range
    const newRegistrations = await Customer.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get total jobs (if Job model exists)
    let totalJobs = 0;
    let activeJobs = 0;
    let completedJobs = 0;
    let pendingJobs = 0;
    let recentJobActivity = 0;
    
    try {
      totalJobs = await Job.countDocuments();
      
      // Count jobs by status
      const jobStats = await Job.aggregate([
        {
          $group: {
            _id: { $toLower: "$status" },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Process job stats
      jobStats.forEach(stat => {
        switch (stat._id) {
          case 'completed':
            completedJobs = stat.count;
            break;
          case 'pending':
            pendingJobs = stat.count;
            break;
          case 'active':
          case 'in-progress':
            activeJobs += stat.count;
            break;
        }
      });
      
      // Get recent job activity (jobs created or updated in time range)
      recentJobActivity = await Job.countDocuments({
        $or: [
          { created_at: { $gte: startDate } },
          { updated_at: { $gte: startDate } }
        ]
      });
      
    } catch (error) {
      console.log('Job model not available, skipping job statistics');
    }

    // Calculate system uptime and performance metrics
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Calculate memory usage percentage (assuming 1GB default if not available)
    const totalMemoryMB = (memoryUsage.heapTotal + memoryUsage.external) / 1024 / 1024;
    const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024;
    const memoryUsagePercent = Math.round((usedMemoryMB / totalMemoryMB) * 100);

    // Mock error rate calculation (you can implement actual error logging)
    const errorRate = Math.random() * 0.05; // Random between 0-0.05%
    
    // Calculate trends
    const userGrowthTrend = totalCustomers > 0 ? ((newRegistrations / totalCustomers) * 100) : 0;
    const activityTrend = totalCustomers > 0 ? ((recentLogins / totalCustomers) * 100) : 0;

    const analytics = {
      // Dashboard Overview specific fields
      totalCustomers: totalCustomers,
      kycRecords: kycVerified,
      activeSessions: activeSessions,
      
      // Additional analytics data
      users: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        recentLogins,
        newRegistrations,
        growthTrend: userGrowthTrend,
        kycVerified: kycVerified,
        activeSessions: activeSessions
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        completed: completedJobs,
        pending: pendingJobs,
        recentActivity: recentJobActivity
      },
      system: {
        uptime: uptimeSeconds,
        uptimePercent: 99.9, // Mock uptime percentage
        memory: {
          used: Math.round(usedMemoryMB),
          total: Math.round(totalMemoryMB),
          percentage: memoryUsagePercent
        },
        errorRate: errorRate,
        platform: process.platform,
        nodeVersion: process.version
      },
      activity: {
        trend: activityTrend,
        sessionsToday: activeSessions,
        timeRange: timeRange
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const { type = 'active', limit = 5 } = req.query;
    
    let query = {};
    let sort = { createdAt: -1 };
    
    switch (type) {
      case 'active':
        query = { isActive: false };
        break;
      case 'inactive':
        query = { isActive: true };
        break;
      case 'recent':
        query = {};
        sort = { createdAt: -1 };
        break;
      default:
        query = { isActive: true }; // Default to active users
    }

    const users = await Customer.find(query)
      .select('name ie_code_no pan_number isActive createdAt updatedAt')
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
};

// Get system metrics
export const getSystemMetrics = async (req, res) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics'
    });
  }
};

// Get historical analytics data for charts
export const getHistoricalAnalytics = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range and intervals
    const now = new Date();
    let startDate, intervals;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervals = 24; // Hours
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervals = 7; // Days
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervals = 30; // Days
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        intervals = 12; // Weeks (approximately)
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervals = 7;
    }

    // Generate mock historical data for demonstration
    // In a real application, you would query actual historical data
    const userGrowthData = [];
    const activityData = [];
    const systemHealthData = [];
    
    for (let i = intervals - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * (timeRange === '1d' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
      const label = timeRange === '1d' 
        ? date.getHours() + ':00'
        : timeRange === '90d'
          ? 'Week ' + Math.ceil((intervals - i) / 7)
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Mock user growth data
      userGrowthData.push({
        period: label,
        users: Math.floor(Math.random() * 50) + 100 + i * 5,
        sessions: Math.floor(Math.random() * 30) + 50 + i * 3,
        date: date.toISOString()
      });
      
      // Mock activity data
      activityData.push({
        period: label,
        logins: Math.floor(Math.random() * 40) + 20,
        registrations: Math.floor(Math.random() * 10) + 2,
        date: date.toISOString()
      });
      
      // Mock system health data
      systemHealthData.push({
        period: label,
        cpuUsage: Math.floor(Math.random() * 20) + 25,
        memoryUsage: Math.floor(Math.random() * 15) + 40,
        responseTime: Math.floor(Math.random() * 50) + 100,
        date: date.toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        userGrowth: userGrowthData,
        activity: activityData,
        systemHealth: systemHealthData,
        timeRange: timeRange
      }
    });
  } catch (error) {
    console.error('Historical analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical analytics'
    });
  }
};