import { Router } from 'express';
import { getMe, updateMe } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

// All user routes require authentication
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, validate(updateUserSchema), updateMe);

export default router;
