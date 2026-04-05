import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import homeRoutes from './home.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/home', homeRoutes);
// ...add more routes
export default router;
