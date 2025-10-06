import { PrismaClient, Movement, Prisma, MovementType } from '@prisma/client';
import { BaseRepository } from '@/data/models/BaseRepository';
import { QueryParams, CreateMovementRequest } from '@/types';

export class MovementRepository extends BaseRepository<Movement> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Movement | null> {
    return this.prisma.movement.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        }
      }
    });
  }

  async findAll(params?: QueryParams): Promise<{ data: Movement[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      filter = {}
    } = params || {};

    const where = this.buildWhereClause(filter);

    // Add search functionality
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        {
          item: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
              supplier: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.movement.count({ where })
    ]);

    return {
      data: movements,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async create(data: CreateMovementRequest): Promise<Movement> {
    return this.prisma.movement.create({
      data: data as any,
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<CreateMovementRequest>): Promise<Movement> {
    return this.prisma.movement.update({
      where: { id },
      data: data as any,
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.movement.delete({
      where: { id }
    });
  }

  async getMovementsByItem(itemId: string, params?: QueryParams): Promise<{ data: Movement[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params || {};

    const where = { itemId };

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
              supplier: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.movement.count({ where })
    ]);

    return {
      data: movements,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async getRecentMovements(limit: number = 10): Promise<Movement[]> {
    return this.prisma.movement.findMany({
      include: {
        item: {
          include: {
            category: true,
            supplier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getMovementsByType(type: MovementType, params?: QueryParams): Promise<{ data: Movement[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params || {};

    const where: Prisma.MovementWhereInput = { type };

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
              supplier: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.movement.count({ where })
    ]);

    return {
      data: movements,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async getMovementStats(itemId?: string): Promise<{
    totalIn: number;
    totalOut: number;
    totalAdjustments: number;
    totalTransfers: number;
    totalReturns: number;
  }> {
    const where = itemId ? { itemId } : {};

    const [inMovements, outMovements, adjustments, transfers, returns] = await Promise.all([
      this.prisma.movement.aggregate({
        where: { ...where, type: 'IN' },
        _sum: { quantity: true }
      }),
      this.prisma.movement.aggregate({
        where: { ...where, type: 'OUT' },
        _sum: { quantity: true }
      }),
      this.prisma.movement.aggregate({
        where: { ...where, type: 'ADJUSTMENT' },
        _sum: { quantity: true }
      }),
      this.prisma.movement.aggregate({
        where: { ...where, type: 'TRANSFER' },
        _sum: { quantity: true }
      }),
      this.prisma.movement.aggregate({
        where: { ...where, type: 'RETURN' as any },
        _sum: { quantity: true }
      })
    ]);

    return {
      totalIn: inMovements._sum.quantity || 0,
      totalOut: outMovements._sum.quantity || 0,
      totalAdjustments: adjustments._sum.quantity || 0,
      totalTransfers: transfers._sum.quantity || 0,
      totalReturns: (returns._sum?.quantity as number | undefined) || 0
    };
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date, params?: QueryParams): Promise<{ data: Movement[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params || {};

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
              supplier: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.movement.count({ where })
    ]);

    return {
      data: movements,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }
}
