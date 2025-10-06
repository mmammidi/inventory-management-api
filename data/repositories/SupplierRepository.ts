import { PrismaClient, Supplier } from '@prisma/client';
import { BaseRepository } from '@/data/models/BaseRepository';
import { QueryParams, CreateSupplierRequest, UpdateSupplierRequest } from '@/types';

export class SupplierRepository extends BaseRepository<Supplier> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async findAll(params?: QueryParams): Promise<{ data: Supplier[]; pagination: any }> {
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
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        ...this.buildPagination(page, limit)
      }),
      this.prisma.supplier.count({ where })
    ]);

    return {
      data: suppliers,
      pagination: this.calculatePaginationInfo(page, limit, total)
    };
  }

  async create(data: CreateSupplierRequest): Promise<Supplier> {
    return this.prisma.supplier.create({
      data,
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async update(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    return this.prisma.supplier.update({
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
    // Check if supplier has items
    const itemCount = await this.prisma.item.count({
      where: { supplierId: id }
    });

    if (itemCount > 0) {
      throw new Error('Cannot delete supplier with existing items');
    }

    await this.prisma.supplier.delete({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { name },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    return this.prisma.supplier.findFirst({
      where: { email },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }
}
