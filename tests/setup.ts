import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://inventory_user:inventory_password@localhost:5432/inventory_test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3001';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';
process.env.LOG_LEVEL = 'error';

// Global test setup
beforeAll(async () => {
  if (process.env.UNIT_ONLY === 'true') {
    return;
  }
  // Reset test database
  try {
    execSync('npx prisma db push --force-reset', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  } catch (error) {
    console.warn('Database reset failed, continuing with tests:', error);
  }
});

// Global test teardown
afterAll(async () => {
  if (process.env.UNIT_ONLY === 'true') {
    return;
  }
  // Clean up test database
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.warn('Database disconnect failed:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  if (process.env.UNIT_ONLY === 'true') {
    return;
  }
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  
  try {
    // Clean up test data
    await prisma.movement.deleteMany();
    await prisma.item.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  } catch (error) {
    console.warn('Test cleanup failed:', error);
  }
});
