import { Router } from 'express';
import { createSession } from '../controllers/sessions.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createSessionSchema } from '../validators/session.validator';

const router = Router();

// POST /api/sessions — log a meditation session
router.post('/', authenticateToken, validate(createSessionSchema), createSession);

export default router;
