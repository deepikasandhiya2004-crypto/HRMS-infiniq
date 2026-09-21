import { Router } from 'express';
import currentUser from '../middleware/currentUser.js';

const router = Router();

router.get('/', currentUser, (req, res) => {
  res.json({ user: req.user });
});

export default router;