import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(currentUser);
router.get('/', getDashboard);

export default router;