import { Router } from 'express';
import { getMe, updateMe } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateMe);

export default router;
