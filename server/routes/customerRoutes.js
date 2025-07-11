import express from "express";
import {
  login,
  registerCustomer,
  forgotPassword,
  logout,
  postColumnOrder,
  getColumnOrder,
  getCustomerKycList,
  getRegisteredCustomers,
  updateCustomerPassword,
  validateSession,
  getInactiveCustomers,
  generateSSOToken,
} from "../controllers/customerController.js";
import { protectSuperAdmin } from "../controllers/superAdminController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer authentication routes (open to customers)
router.post("/api/login", login);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/logout", logout);
router.get("/api/validate-session", authenticate, validateSession);
router.post("/api/column-order", postColumnOrder);
router.get("/api/column-order", getColumnOrder);

// SSO token generation for E-Lock redirection
router.post("/api/generate-sso-token", authenticate, generateSSOToken);

// SuperAdmin protected registration routes
router.post("/api/register", protectSuperAdmin, registerCustomer);
router.get("/api/customer-kyc-list", protectSuperAdmin, getCustomerKycList);
router.get("/api/registered-customers", protectSuperAdmin, getRegisteredCustomers);
router.get("/api/inactive-customers", protectSuperAdmin, getInactiveCustomers);
router.put("/api/customer/:customerId/password", protectSuperAdmin, updateCustomerPassword);

export default router;
