import { PrismaClient, User } from '@prisma/client';
import { BaseRepository } from '@/data/models/BaseRepository';
import { QueryParams, CreateUserRequest, UpdateUserRequest } from '@/types';

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findAll(params?: QueryParams): Promise<{ data: User[]; pagination: any }> {
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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async create(data: CreateUserRequest): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role && ['ADMIN','MANAGER','USER'].includes(data.role)) ? data.role as any : 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role && ['ADMIN','MANAGER','USER'].includes(data.role)) ? (data.role as any) : undefined,
        isActive: data.status ? (data.status === 'ACTIVE') : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { firstName: 'asc' }
    });
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    managerUsers: number;
    regularUsers: number;
  }> {
    const [total, active, inactive, admins, managers, regular] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'MANAGER' } }),
      this.prisma.user.count({ where: { role: 'USER' } })
    ]);

    return {
      totalUsers: total,
      activeUsers: active,
      inactiveUsers: inactive,
      adminUsers: admins,
      managerUsers: managers,
      regularUsers: regular
    };
  }
}