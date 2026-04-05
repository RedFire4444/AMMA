import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import homeRoutes from './home.routes';
import coursesRoutes from './courses.routes';
import sessionsRoutes from './sessions.routes';
import habitsRoutes from './habits.routes';
import directoryRoutes from './directory.routes';
import eventsRoutes from './events.routes';
import notificationsRoutes from './notifications.routes';
import paymentsRoutes from './payments.routes';
import subscriptionsRoutes from './subscriptions.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/home', homeRoutes);
router.use('/courses', coursesRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/habits', habitsRoutes);
router.use('/directory', directoryRoutes);
router.use('/events', eventsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/subscriptions', subscriptionsRoutes);

export default router;
