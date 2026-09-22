import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import { getMyTeam, getMember } from '../controllers/team.controller.js';

const router = Router();
router.use(authGuard);
router.get('/my', getMyTeam);
router.get('/members/:id', getMember);
export default router;