import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import requireRole from '../middleware/requireRole.js';
import { REVIEWER_ROLES } from '../config/roles.js';
import {
  getLeaveTypes,
  getLeaveBalances,
  getMyLeaves,
  applyLeave,
  cancelLeave,
  getTeamLeaves,
  reviewLeave,
  getLeaveCalendar,
} from '../controllers/leave.controller.js';

const router = Router();

router.use(currentUser);

// Personal Leave Endpoints
router.get('/types', getLeaveTypes);
router.get('/balances', getLeaveBalances);
router.get('/my', getMyLeaves);
router.post('/apply', applyLeave);
router.post('/:id/cancel', cancelLeave);

// Calendar (all authenticated users)
router.get('/calendar', getLeaveCalendar);

// Reviewer / Manager & HR Endpoints
const reviewers = requireRole(...REVIEWER_ROLES);
router.get('/team', reviewers, getTeamLeaves);
router.post('/:id/review', reviewers, reviewLeave);

export default router;
