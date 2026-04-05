import { Router } from 'express';
import { getHomeFeed } from '../controllers/home.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.get('/feed', authenticateToken, getHomeFeed);
export default router;
