import { PrismaClient } from '@prisma/client';
import { QueryParams } from '@/types';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  protected buildWhereClause(filters: Record<string, any> = {}): any {
    const where: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          where[key] = {
            contains: value,
            mode: 'insensitive'
          };
        } else if (Array.isArray(value)) {
          where[key] = {
            in: value
          };
        } else {
          where[key] = value;
        }
      }
    });

    return where;
  }

  protected buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy) return { createdAt: 'desc' };

    return {
      [sortBy]: sortOrder
    };
  }

  protected buildPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  protected calculatePaginationInfo(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  abstract findById(id: string): Promise<T | null>;
  abstract findAll(params?: QueryParams): Promise<{ data: T[]; pagination: any }>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
