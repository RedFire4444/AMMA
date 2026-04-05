import { Router } from 'express';
import { listNotifications } from '../controllers/notifications.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/notifications — list user's notifications
router.get('/', authenticateToken, listNotifications);

export default router;
