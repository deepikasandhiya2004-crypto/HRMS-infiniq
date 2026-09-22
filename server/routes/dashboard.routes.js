import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(authGuard);
router.get('/', getDashboard);
export default router;