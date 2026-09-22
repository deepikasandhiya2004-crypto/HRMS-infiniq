import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';
import requireRole from '../middleware/requireRole.js';
import { ALL_SCOPE_ROLES } from '../config/roles.js';
import { getConfig, updateConfig } from '../controllers/configuration.controller.js';

const router = Router();

router.use(currentUser);

const hrOnly = requireRole(...ALL_SCOPE_ROLES);

router.get('/', getConfig);
router.get('/:category', getConfig);
router.put('/:category', hrOnly, updateConfig);

export default router;
