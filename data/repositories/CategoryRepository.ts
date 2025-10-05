import { PrismaClient, Category } from '@prisma/client';
import { BaseRepository } from '@/data/models/BaseRepository';
import { QueryParams, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async findAll(params?: QueryParams): Promise<{ data: Category[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      filter = {}
    } = params || {};

    const where = this.buildWhereClause(filter);

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.category.count({ where })
    ]);

    return {
      data: categories,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    return this.prisma.category.create({
      data,
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    // Check if category has items
    const itemCount = await this.prisma.item.count({
      where: { categoryId: id }
    });

    if (itemCount > 0) {
      throw new Error('Cannot delete category with existing items');
    }

    await this.prisma.category.delete({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { name },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getCategoryStats(): Promise<Array<{ category: string; itemCount: number }>> {
    const result = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        items: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return result.map(category => ({
      category: category.name,
      itemCount: category._count.items
    }));
  }
}
