import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import { getSettings, updateAccount, updatePreferences } from '../controllers/settings.controller.js';

const router = Router();
router.use(authGuard);
router.get('/', getSettings);
router.patch('/account', updateAccount);
router.patch('/preferences', updatePreferences);
export default router;