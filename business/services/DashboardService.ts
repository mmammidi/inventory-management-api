import Database from '@/data/models/Database';
import { 
  DashboardStats,
  ApiResponse
} from '@/types';

export class DashboardService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const [
        totalItems,
        totalCategories,
        totalSuppliers,
        lowStockItems,
        outOfStockItems,
        totalValue,
        recentMovements,
        topCategories
      ] = await Promise.all([
        this.getTotalItemsCount(),
        this.getTotalCategoriesCount(),
        this.getTotalSuppliersCount(),
        this.getLowStockItemsCount(),
        this.getOutOfStockItemsCount(),
        this.getTotalInventoryValue(),
        this.getRecentMovements(),
        this.getTopCategories()
      ]);

      const stats: DashboardStats = {
        totalItems,
        totalCategories,
        totalSuppliers,
        lowStockItems,
        outOfStockItems,
        totalValue,
        recentMovements,
        topCategories
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard stats'
      };
    }
  }

  private async getTotalItemsCount(): Promise<number> {
    return this.db.getPrismaClient().item.count({
      where: { isActive: true }
    });
  }

  private async getTotalCategoriesCount(): Promise<number> {
    return this.db.getPrismaClient().category.count();
  }

  private async getTotalSuppliersCount(): Promise<number> {
    return this.db.getPrismaClient().supplier.count({
      where: { isActive: true }
    });
  }

  private async getLowStockItemsCount(): Promise<number> {
    const lowStockItems = await this.db.items.findLowStockItems();
    return lowStockItems.length;
  }

  private async getOutOfStockItemsCount(): Promise<number> {
    const outOfStockItems = await this.db.items.findOutOfStockItems();
    return outOfStockItems.length;
  }

  private async getTotalInventoryValue(): Promise<number> {
    // Calculate total value (quantity * cost) for active items
    const items = await this.db.getPrismaClient().item.findMany({
      where: { isActive: true },
      select: { quantity: true, cost: true }
    });

    return items.reduce((total, item) => total + (item.quantity * Number(item.cost)), 0);
  }

  private async getRecentMovements() {
    const movements = await this.db.getPrismaClient().movement.findMany({
      include: {
        item: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return movements.map(movement => ({
      id: movement.id,
      item: {
        id: movement.item.id,
        name: movement.item.name,
        sku: movement.item.sku
      },
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason || undefined,
      reference: movement.reference || undefined,
      user: {
        id: movement.user.id,
        firstName: movement.user.firstName || undefined,
        lastName: movement.user.lastName || undefined,
        email: movement.user.email,
        username: movement.user.username,
      },
      notes: movement.notes || undefined,
      createdAt: movement.createdAt
    }));
  }

  private async getTopCategories() {
    const categoryStats = await this.db.categories.getCategoryStats();
    return categoryStats.slice(0, 5); // Top 5 categories
  }

  async getInventoryReport(): Promise<ApiResponse<any[]>> {
    try {
      const items = await this.db.getPrismaClient().item.findMany({
        where: { isActive: true },
        include: {
          category: true,
          supplier: true,
          movements: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { name: 'asc' }
      });

      const report = await Promise.all(items.map(async (item) => {
        const movementStats = await this.db.movements.getMovementStats(item.id);
        
        return {
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          currentQuantity: item.quantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          status: item.isActive ? 'ACTIVE' : 'INACTIVE',
          lastMovement: item.movements[0]?.createdAt,
          totalIn: movementStats.totalIn,
          totalOut: movementStats.totalOut,
          category: item.category.name,
          supplier: item.supplier?.name
        };
      }));

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating inventory report:', error);
      return {
        success: false,
        error: 'Failed to generate inventory report'
      };
    }
  }

  async getMonthlyMovements(): Promise<ApiResponse<any[]>> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
      startDate.setDate(1); // First day of the month

      const endDate = new Date();

      const movements = await this.db.getPrismaClient().movement.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          item: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group by month and type
      const monthlyData = movements.reduce((acc: any, movement) => {
        const month = movement.createdAt.toISOString().substring(0, 7); // YYYY-MM
        const type = movement.type;

        if (!acc[month]) {
          acc[month] = {
            month,
            IN: 0,
            OUT: 0,
            ADJUSTMENT: 0,
            TRANSFER: 0,
            RETURN: 0
          };
        }

        acc[month][type] += movement.quantity;
        return acc;
      }, {});

      const result = Object.values(monthlyData).sort((a: any, b: any) => 
        a.month.localeCompare(b.month)
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error fetching monthly movements:', error);
      return {
        success: false,
        error: 'Failed to fetch monthly movements'
      };
    }
  }
}
