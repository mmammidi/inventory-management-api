import { PrismaClient } from '@prisma/client';
import { ItemRepository } from '@/data/repositories/ItemRepository';
import { CategoryRepository } from '@/data/repositories/CategoryRepository';
import { SupplierRepository } from '@/data/repositories/SupplierRepository';
import { MovementRepository } from '@/data/repositories/MovementRepository';
import { UserRepository } from '@/data/repositories/UserRepository';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;
  
  // Repositories
  public items: ItemRepository;
  public categories: CategoryRepository;
  public suppliers: SupplierRepository;
  public movements: MovementRepository;
  public users: UserRepository;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Initialize repositories
    this.items = new ItemRepository(this.prisma);
    this.categories = new CategoryRepository(this.prisma);
    this.suppliers = new SupplierRepository(this.prisma);
    this.movements = new MovementRepository(this.prisma);
    this.users = new UserRepository(this.prisma);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default Database;
