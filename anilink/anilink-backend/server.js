import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';
import 'express-async-errors';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketServer } from './sockets/socketManager.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import vetRoutes from './routes/vets.js';
import appointmentRoutes from './routes/appointments.js';
import availabilityRoutes from './routes/availability.js';
import herdRoutes from './routes/herds.js';
import animalRoutes from './routes/animals.js';
import healthRecordRoutes from './routes/healthRecords.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import conversationRoutes from './routes/conversations.js';
import adminRoutes from './routes/admin.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(apiRateLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AniLink API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/herds', herdRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// TODO: integrate external AI providers if needed

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Store server instance for graceful shutdown
let server = null;
let httpServer = null;

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle nodemon restart (SIGUSR2 on Unix, but Windows uses different signals)
if (process.platform === 'win32') {
  // On Windows, nodemon sends SIGINT
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
}

// Start server with retry mechanism
let dbConnected = false;
const startServer = async (retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  try {
    // Connect to MongoDB (only once)
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    
    if (!httpServer) {
      httpServer = http.createServer(app);
      initSocketServer(httpServer);
    }

    // Start listening
    server = httpServer.listen(PORT, () => {
      console.log(`🚀 AniLink Backend Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors (e.g., port already in use)
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        server = null; // Reset server instance
        if (retryCount < MAX_RETRIES) {
          console.warn(`⚠️  Port ${PORT} is in use. Retrying in ${RETRY_DELAY / 1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return startServer(retryCount + 1);
        } else {
          console.error(`❌ Port ${PORT} is still in use after ${MAX_RETRIES} retries.`);
          console.error(`💡 Please stop the other process using port ${PORT} or use a different port.`);
          console.error(`💡 On Windows, you can find and kill the process with: netstat -ano | findstr :${PORT}`);
          process.exit(1);
        }
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

