import { Router } from 'express';
import {
  browseDirectory,
  bookmarkContent,
  removeBookmark,
  getBookmarks,
  trackView,
} from '../controllers/directory.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/directory — browse content with search, filter, pagination
router.get('/', authenticateToken, browseDirectory);

// GET /api/directory/bookmarks — get user's bookmarked content
// NOTE: This must be before /:id routes to avoid conflict
router.get('/bookmarks', authenticateToken, getBookmarks);

// POST /api/directory/:id/bookmark — bookmark a content item
router.post('/:id/bookmark', authenticateToken, bookmarkContent);

// DELETE /api/directory/:id/bookmark — remove a bookmark
router.delete('/:id/bookmark', authenticateToken, removeBookmark);

// POST /api/directory/:id/view — track a content view
router.post('/:id/view', authenticateToken, trackView);

export default router;
