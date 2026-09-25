import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { REVIEWER_ROLES } from '../config/roles.js';
import {
  getToday,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getHistory,
  getTeamAttendance,
} from '../controllers/attendance.controller.js';
import {
  createRequest,
  listMyRequests,
  listPending,
  approveRequest,
  rejectRequest,
} from '../controllers/requests.controller.js';

const router = Router();
router.use(authGuard);

router.get('/today', getToday);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/history', getHistory);
router.post('/requests', createRequest);
router.get('/requests/mine', listMyRequests);

const reviewers = requireRole(...REVIEWER_ROLES);
router.get('/requests/pending', reviewers, listPending);
router.post('/requests/:id/approve', reviewers, approveRequest);
router.post('/requests/:id/reject', reviewers, rejectRequest);
router.get('/team', reviewers, getTeamAttendance);

export default router;