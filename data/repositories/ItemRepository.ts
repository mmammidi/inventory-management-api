import { PrismaClient, Item, Prisma } from '@prisma/client';
import { BaseRepository } from '@/data/models/BaseRepository';
import { QueryParams, CreateItemRequest, UpdateItemRequest } from '@/types';

export class ItemRepository extends BaseRepository<Item> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async findAll(params?: QueryParams): Promise<{ data: Item[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      filter = {}
    } = params || {};

    const where: Prisma.ItemWhereInput = this.buildWhereClause(filter);

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        include: {
          category: true,
          supplier: true
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.item.count({ where })
    ]);

    return {
      data: items,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async create(data: CreateItemRequest): Promise<Item> {
    return this.prisma.item.create({
      data: {
        ...data
      },
      include: {
        category: true,
        supplier: true
      }
    });
  }

  async update(id: string, data: UpdateItemRequest): Promise<Item> {
    const updateData: any = { ...data };

    return this.prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        supplier: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.item.delete({
      where: { id }
    });
  }

  async findBySku(sku: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true
      }
    });
  }

  async findByBarcode(barcode: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { barcode },
      include: {
        category: true,
        supplier: true
      }
    });
  }

  async findLowStockItems(): Promise<Item[]> {
    // Prisma does not support comparing two columns directly in a filter.
    // Fetch active items and filter low stock in memory.
    const items = await this.prisma.item.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
      orderBy: { quantity: 'asc' }
    });
    return items.filter(i => i.quantity <= i.minQuantity);
  }

  async findOutOfStockItems(): Promise<Item[]> {
    return this.prisma.item.findMany({
      where: {
        quantity: 0,
        isActive: true
      },
      include: {
        category: true,
        supplier: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async updateQuantity(id: string, quantity: number): Promise<Item> {
    return this.prisma.item.update({
      where: { id },
      data: { quantity },
      include: {
        category: true,
        supplier: true
      }
    });
  }

  async getItemsByCategory(categoryId: string, params?: QueryParams): Promise<{ data: Item[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params || {};

    const where = { categoryId };

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        include: {
          category: true,
          supplier: true
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.item.count({ where })
    ]);

    return {
      data: items,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async getItemsBySupplier(supplierId: string, params?: QueryParams): Promise<{ data: Item[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params || {};

    const where = { supplierId };

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        include: {
          category: true,
          supplier: true
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.item.count({ where })
    ]);

    return {
      data: items,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async getTotalValue(): Promise<number> {
    // Sum quantity * cost for active items
    const items = await this.prisma.item.findMany({
      where: { isActive: true },
      select: { quantity: true, cost: true }
    });

    return items.reduce((total, item) => total + (item.quantity * Number(item.cost)), 0);
  }
}
