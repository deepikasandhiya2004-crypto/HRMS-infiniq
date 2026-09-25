import { Router } from 'express';
import authGuard from '../middleware/auth.js';
import { login, signup, forgotPassword, resetPassword, changePassword, getLoginHistory } from '../controllers/auth.controller.js';

const router = Router();
router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authGuard, changePassword);
router.get('/login-history', authGuard, getLoginHistory);
export default router;