import express from 'express';
import morgan from 'morgan';
import { appConfig, validateEnvironment } from '@/config/app';
import { checkDatabaseConnection, disconnectDatabase } from '@/config/database';
import Database from '@/data/models/Database';

// Import middleware
import { 
  securityHeaders, 
  corsMiddleware, 
  compressionMiddleware, 
  requestLogger,
  generalLimiter,
  devLimiter,
  authLimiter
} from '@/presentation/middleware/security';
import { 
  errorHandler, 
  notFoundHandler, 
  handleUnhandledRejection, 
  handleUncaughtException 
} from '@/presentation/middleware/errorHandler';
import { morganStream } from '@/utils/logger';

// Import routes
import routes from '@/routes';
import swaggerRoutes from '@/routes/swagger';

// Initialize Express app
const app = express();

// Validate environment variables
validateEnvironment();

// Global error handlers
handleUnhandledRejection();
handleUncaughtException();

// Security middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(compressionMiddleware);

// Rate limiting - use development-friendly limiter in dev mode
app.use(process.env.NODE_ENV === 'development' ? devLimiter : generalLimiter);

// Request logging
app.use(requestLogger);
app.use(morgan('combined', { stream: morganStream }));

// Body parsing middleware
app.use(express.json({ limit: appConfig.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: appConfig.maxFileSize }));

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Swagger documentation routes
app.use('/api-docs', swaggerRoutes);

// API routes
app.use(appConfig.apiPrefix, routes);

// Special rate limiting for auth endpoints
app.use(`${appConfig.apiPrefix}/auth`, authLimiter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async (): Promise<void> => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Starting server without database...');
    } else {
      // Initialize database singleton
      const db = Database.getInstance();
      await db.connect();
    }

    // Start server
    const server = app.listen(appConfig.port, appConfig.host, () => {
      console.log(`
🚀 Inventory Management API Server Started!
📍 Server: http://${appConfig.host}:${appConfig.port}
🌍 Environment: ${appConfig.nodeEnv}
📊 API Version: ${appConfig.apiVersion}
🔗 API Base URL: http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await disconnectDatabase();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server unless running under test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
