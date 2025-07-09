import express from "express";
import {
  logActivity,
  getRecentActivities,
  getUserActivities,
  getActivityStats,
  getSuspiciousActivities,
  flagActivityAsSuspicious,
  getActiveSessions,
  bulkLogActivities
} from "../controllers/activityController.js";
import { protectSuperAdmin } from "../controllers/superAdminController.js";

const router = express.Router();

// Public routes (for logging activities from client)
router.post("/api/activity/log", logActivity);
router.post("/api/activity/bulk-log", bulkLogActivities);

// SuperAdmin protected routes
router.get("/api/activity/recent", protectSuperAdmin, getRecentActivities);
router.get("/api/activity/stats", protectSuperAdmin, getActivityStats);
router.get("/api/activity/suspicious", protectSuperAdmin, getSuspiciousActivities);
router.get("/api/activity/sessions", protectSuperAdmin, getActiveSessions);
router.get("/api/activity/user/:userId", protectSuperAdmin, getUserActivities);
router.patch("/api/activity/:activityId/flag", protectSuperAdmin, flagActivityAsSuspicious);

export default router;
