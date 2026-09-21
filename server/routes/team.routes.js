import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import { getMyTeam, getMember } from '../controllers/team.controller.js';

const router = Router();

router.use(currentUser);
router.get('/my', getMyTeam);
router.get('/members/:id', getMember);

export default router;