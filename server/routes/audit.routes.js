import express from "express";
import authGuard from "../middleware/auth.js";
import { getAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

router.get("/", authGuard, getAuditLogs);

// Admin History
router.get("/admin-history", authGuard, getAuditLogs);

export default router;