import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import {
  getSettings,
  updateAccount,
  updatePreferences,
} from '../controllers/settings.controller.js';

const router = Router();

router.use(currentUser);
router.get('/', getSettings);
router.patch('/account', updateAccount);
router.patch('/preferences', updatePreferences);

export default router;