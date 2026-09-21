import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import {
  getToday,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getHistory,
} from '../controllers/attendance.controller.js';
import requireRole from '../middleware/requireRole.js';
import {
  createRequest,
  listMyRequests,
  listPending,
  approveRequest,
  rejectRequest,
} from '../controllers/requests.controller.js';
import { REVIEWER_ROLES } from '../config/roles.js';

const router = Router();

router.use(currentUser);
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

export default router;