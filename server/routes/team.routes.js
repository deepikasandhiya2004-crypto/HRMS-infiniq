import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { REVIEWER_ROLES } from '../config/roles.js';
import { getMyTeam, getMember, createTeamMember } from '../controllers/team.controller.js';

const router = Router();
router.use(authGuard);

router.get('/my', getMyTeam);
router.get('/members/:id', getMember);
router.post('/members', requireRole(...REVIEWER_ROLES), createTeamMember);

export default router;