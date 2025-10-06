import { PrismaClient, $Enums } from '@prisma/client';
import { Request, Response } from 'express';
import { User, Category, Supplier, Item, Movement } from '@prisma/client';

export class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } }
    });
  }

  async createTestUser(overrides: Partial<User> = {}): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: $Enums.UserRole.USER,
        isActive: true,
        ...overrides
      }
    });
  }

  async createTestCategory(overrides: Partial<Category> = {}): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test category description',
        isActive: true,
        ...overrides
      }
    });
  }

  async createTestSupplier(overrides: Partial<Supplier> = {}): Promise<Supplier> {
    return this.prisma.supplier.create({
      data: {
        name: 'Test Supplier',
        contactName: 'John Doe',
        email: 'supplier@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
        isActive: true,
        ...overrides
      }
    });
  }

  async createTestItem(overrides: Partial<Item> = {}): Promise<Item> {
    const category = await this.createTestCategory();
    const supplier = await this.createTestSupplier();

    return this.prisma.item.create({
      data: {
        name: 'Test Item',
        description: 'Test item description',
        sku: 'TEST-001',
        barcode: '123456789',
        price: 10.99,
        cost: 5.99,
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 1000,
        unit: 'pcs',
        isActive: true,
        categoryId: category.id,
        supplierId: supplier.id,
        ...overrides
      }
    });
  }

  async createTestMovement(overrides: Partial<Movement> = {}): Promise<Movement> {
    const user = await this.createTestUser();
    const item = await this.createTestItem();

    return this.prisma.movement.create({
      data: {
        type: 'IN',
        quantity: 10,
        reason: 'Test movement',
        reference: 'REF-001',
        notes: 'Test notes',
        itemId: item.id,
        userId: user.id,
        ...overrides
      }
    });
  }

  async cleanup(): Promise<void> {
    await this.prisma.movement.deleteMany();
    await this.prisma.item.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.supplier.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides
});

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: $Enums.UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'test-category-id',
  name: 'Test Category',
  description: 'Test category description',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'test-supplier-id',
  name: 'Test Supplier',
  contactName: 'John Doe',
  email: 'supplier@example.com',
  phone: '123-456-7890',
  address: '123 Test St',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'test-item-id',
  name: 'Test Item',
  description: 'Test item description',
  sku: 'TEST-001',
  barcode: '123456789',
  price: 10.99,
  cost: 5.99,
  quantity: 100,
  minQuantity: 10,
  maxQuantity: 1000,
  unit: 'pcs',
  isActive: true,
  categoryId: 'test-category-id',
  supplierId: 'test-supplier-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockMovement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'test-movement-id',
  type: $Enums.MovementType.IN,
  quantity: 10,
  reason: 'Test movement',
  reference: 'REF-001',
  notes: 'Test notes',
  itemId: 'test-item-id',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});
