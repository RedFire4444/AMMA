import { Router } from 'express';
import {
  listEvents,
  registerForEvent,
  getStreamUrl,
} from '../controllers/events.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/events — list upcoming events
router.get('/', authenticateToken, listEvents);

// POST /api/events/:id/register — register for an event
router.post('/:id/register', authenticateToken, registerForEvent);

// GET /api/events/:id/stream — get stream URL (must be registered)
router.get('/:id/stream', authenticateToken, getStreamUrl);

export default router;
