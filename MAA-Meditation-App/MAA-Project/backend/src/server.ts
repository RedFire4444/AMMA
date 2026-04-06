/**
 * File: server.ts
 *
 * Description: Express server entry point. Configures middleware stack (helmet, CORS, rate-limiting, logging) and mounts all API routes.
 *
 * Author: Navnit(Ninjacode911)
 */

import 'dotenv/config'; // ⚠️ MUST be first — loads .env before any other imports read process.env
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3001'] }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
