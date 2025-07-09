import express from "express";
import {
  getAvailableModules,
  getCustomerModuleAssignments,
  updateCustomerModuleAssignments,
  getAllCustomersWithModules,
  bulkAssignModules,
} from "../controllers/moduleController.js";
import { protectSuperAdmin } from "../controllers/superAdminController.js";

const router = express.Router();

// Module management routes (all protected by SuperAdmin authentication)
router.get("/api/modules/available", protectSuperAdmin, getAvailableModules);
router.get("/api/modules/customer/:customerId", protectSuperAdmin, getCustomerModuleAssignments);
router.put("/api/modules/customer/:customerId", protectSuperAdmin, updateCustomerModuleAssignments);
router.get("/api/modules/customers", protectSuperAdmin, getAllCustomersWithModules);
router.post("/api/modules/bulk-assign", protectSuperAdmin, bulkAssignModules);

export default router;
