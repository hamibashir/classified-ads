import path from 'path';
import http from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/logger';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/apiResponse';
import { connectDB, disconnectDB, getDbStatus } from './config/db';
import { initSocketServer, getIO } from './sockets';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import locationRoutes from './routes/locationRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adRoutes from './routes/adRoutes';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const isDev = process.env.NODE_ENV !== 'production';

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile native apps, curl, Postman)
      if (!origin) return callback(null, true);

      // In development, allow any localhost or 127.0.0.1 origin (Next.js, Flutter Web, etc.)
      if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      const allowedOrigins = [CLIENT_URL, 'http://localhost:3000'];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger Middleware
app.use(requestLogger);

// Health Check Endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  sendSuccess(
    res,
    {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus.isConnected ? 'connected' : 'disconnected'
    },
    'Classified Ads PK API is operational',
    200,
    { status: 'healthy' }
  );
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);

// Category Routes
app.use('/api/v1/categories', categoryRoutes);

// Location Routes
app.use('/api/v1/locations', locationRoutes);

// Admin Routes
app.use('/api/v1/admin', adminRoutes);

// Media Upload Routes
app.use('/api/v1/upload', uploadRoutes);

// Ads Core Routes
app.use('/api/v1/ads', adRoutes);

// Real-Time Chat Routes
app.use('/api/v1/chat', chatRoutes);

// Static Media Uploads Directory Serving
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use(
  '/uploads',
  express.static(uploadsPath, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

// 404 Catch-All Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(globalErrorHandler);

// HTTP Server & Socket.IO Binding
const httpServer = http.createServer(app);
const io = initSocketServer(httpServer);

// Server Listener
let serverInstance: http.Server | null = null;

if (process.env.NODE_ENV !== 'test') {
  // Initialize Database Connection
  connectDB().catch((err) => {
    console.warn('[Database] Initial connection error caught:', err);
  });

  serverInstance = httpServer.listen(PORT, () => {
    console.log(`[Classified Ads PK API] Server running on port ${PORT}`);
    console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Health Check] http://localhost:${PORT}/api/v1/health`);
    console.log(`[Socket.IO] Real-time engine ready on port ${PORT}`);
  });

  // Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    await disconnectDB();
    if (io) {
      io.close();
    }
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

export { httpServer, io, getIO };
export default app;

