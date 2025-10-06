import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Application configuration
export const appConfig = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API configuration
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  apiVersion: process.env.API_VERSION || '1.0.0',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'inventory-management-api-jwt-secret-key-2024-production-ready',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Rate limiting configuration
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  
  // Pagination configuration
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10'),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  
  // File upload configuration
  maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
  
  // Security configuration
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-here',
  
  // Cache configuration
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  cacheTTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
  
  // Email configuration (if needed)
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '587'),
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  
  // Redis configuration (if needed)
  redisEnabled: process.env.REDIS_ENABLED === 'true',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  redisPassword: process.env.REDIS_PASSWORD || '',
  
  // Monitoring configuration
  monitoringEnabled: process.env.MONITORING_ENABLED === 'true',
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
};

// Validation function to check required environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    'DATABASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }
  
  // Validate JWT secret strength
  if (appConfig.jwtSecret === 'inventory-management-api-jwt-secret-key-2024-production-ready') {
    console.warn('⚠️  Using default JWT secret. Please set JWT_SECRET environment variable in production!');
  }
  
  // Validate database URL format
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️  Database URL should start with postgresql://');
  }
  
  console.log('✅ Environment validation passed');
};

// Development-specific configuration
export const isDevelopment = appConfig.nodeEnv === 'development';
export const isProduction = appConfig.nodeEnv === 'production';
export const isTest = appConfig.nodeEnv === 'test';

// Export database config for convenience
export const database = {
  url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/inventory_db'
};
