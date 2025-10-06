import { PrismaClient, Prisma } from '@prisma/client';

// Database configuration
export const databaseConfig = {
  // Connection URL from environment
  url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/inventory_db',
  
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  
  // Query timeout
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
  
  // Logging configuration
  logging: (process.env.NODE_ENV === 'development'
    ? (['query', 'info', 'warn', 'error'] as Prisma.LogLevel[])
    : (['error'] as Prisma.LogLevel[])),
  
  // Error formatting
  errorFormat: 'pretty' as const,
};

// Prisma client configuration
export const prismaConfig: PrismaClient = new PrismaClient({
  datasources: {
    db: {
      url: databaseConfig.url,
    },
  },
  log: databaseConfig.logging,
  errorFormat: databaseConfig.errorFormat,
});

// Database health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prismaConfig.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prismaConfig.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};
