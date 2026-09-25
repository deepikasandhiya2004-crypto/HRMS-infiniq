import { Router } from "express";

import currentUser from "../middleware/currentUser.js";

import {
  getAttendanceReport,
  getLeaveReport,
  getEmployeeReport,
  getPerformanceReport,
} from "../controllers/reports.controller.js";

const router = Router();

router.use(currentUser);

router.get("/attendance", getAttendanceReport);

router.get("/leave", getLeaveReport);

router.get("/employees", getEmployeeReport);

router.get("/performance", getPerformanceReport);

export default router;