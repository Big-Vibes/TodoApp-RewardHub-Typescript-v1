import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Server } from 'http';
import morgan from 'morgan';
import { disconnectPrisma } from './config/database.js';
import { config } from './config/env.js';
import { CronJobManager } from './jobs/cronJobs.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import router from './routes/route.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    optionsSuccessStatus: 200,
  })
);

app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api', apiLimiter);
app.use(router);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to RewardHub API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () : Promise<void> => {
  let server: Server | null = null;

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    if (!server) process.exit(0);

    server.close(async () => {
      console.log('HTTP server closed');

      CronJobManager.stopAll();

      try {
        await disconnectPrisma();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Failed to close database connection:', error);
      }

      console.log('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  try {
    server = app.listen(config.port, () => {
      console.log('\nRewardHub API Server Started');
      console.log(`Environment:  ${config.nodeEnv}`);
      console.log(`Server URL:   http://localhost:${config.port}`);
      console.log(`Health Check: http://localhost:${config.port}/api/health`);
      console.log(`CORS Origin:  ${config.cors.origin}\n`);
    });

    CronJobManager.startAll();

    process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error: unknown) => {
      console.error('Uncaught Exception:', error);
      void gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      void gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();

export default app;
