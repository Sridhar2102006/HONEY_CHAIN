import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import { pool } from './db/pool.js';
import authRoutes from './routes/authRoutes.js';
import hiveRoutes from './routes/hiveRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import labRoutes from './routes/labRoutes.js';
import kvicRoutes from './routes/kvicRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cameraRoutes from './routes/cameraRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Safe Health Check endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1 AS status');
    res.json({
      status: 'ok',
      service: 'BeeCrypt Backend API',
      database: dbCheck.rows[0].status === 1 ? 'connected' : 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'BeeCrypt Backend API',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 3. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hives', hiveRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/inspections', inspectionRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/kvic', kvicRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/camera', cameraRoutes);
app.use('/api/v1/sensors', sensorRoutes);

// 4. Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// 5. Start Server
app.listen(PORT, () => {
  console.log(`\n🐝 BeeCrypt API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health\n`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

export default app;
