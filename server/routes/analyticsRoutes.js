import express from "express";
import { getPerKgCostAnalytics, getBestSuppliersByHsCode } from "../controllers/analytics.js";

const router = express.Router();

// Analytics routes
router.get("/api/analytics/per-kg-cost", getPerKgCostAnalytics);
router.get("/api/analytics/best-suppliers", getBestSuppliersByHsCode);

export default router;
