import { Router } from 'express';
import authGuard from '../middleware/auth.js';

const router = Router();
router.get('/', authGuard, (req, res) => res.json({ user: req.user }));
export default router;