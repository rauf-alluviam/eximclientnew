import express from "express";
import {
  superAdminLogin,
  superAdminLogout,
  getSuperAdminProfile,
  protectSuperAdmin,
  createInitialSuperAdmin,
} from "../controllers/superAdminController.js";

const router = express.Router();

// SuperAdmin authentication routes
router.post("/api/superadmin/login", superAdminLogin);
router.post("/api/superadmin/logout", superAdminLogout);
router.get("/api/superadmin/profile", protectSuperAdmin, getSuperAdminProfile);

// Initial setup route (only works if no superadmin exists)
router.post("/api/superadmin/setup", createInitialSuperAdmin);

export default router;
