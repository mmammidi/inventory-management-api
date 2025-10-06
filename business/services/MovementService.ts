import Database from '@/data/models/Database';
import { 
  CreateMovementRequest, 
  MovementResponse, 
  QueryParams,
  ApiResponse,
  PaginationInfo
} from '@/types';
import { Movement } from '@prisma/client';

export class MovementService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async createMovement(data: CreateMovementRequest, userId?: string): Promise<ApiResponse<MovementResponse>> {
    try {
      // Verify item exists
      const item = await this.db.items.findById(data.itemId);
      if (!item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      // Validate movement type and quantity
      if (data.quantity <= 0) {
        return {
          success: false,
          error: 'Quantity must be greater than 0'
        };
      }

      // Check if movement would result in negative inventory (for OUT movements)
      if (data.type === 'OUT' && item.quantity < data.quantity) {
        return {
          success: false,
          error: 'Insufficient inventory. Available quantity: ' + item.quantity
        };
      }

      // Start transaction
      const result = await this.db.getPrismaClient().$transaction(async (prisma) => {
        // Create movement record
        const movement = await prisma.movement.create({
          data: {
            ...data,
            userId
          },
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

        // Update item quantity
        let newQuantity = item.quantity;
        switch (data.type) {
          case 'IN':
          case 'RETURN':
            newQuantity += data.quantity;
            break;
          case 'OUT':
          case 'TRANSFER':
            newQuantity -= data.quantity;
            break;
          case 'ADJUSTMENT':
            newQuantity = data.quantity; // Set to exact quantity
            break;
        }

        // Update item quantity and status
        const updatedItem = await prisma.item.update({
          where: { id: data.itemId },
          data: {
            quantity: newQuantity,
            status: newQuantity === 0 ? 'OUT_OF_STOCK' : 
                   newQuantity <= item.minQuantity ? 'ACTIVE' : 'ACTIVE'
          }
        });

        return { movement, updatedItem };
      });

      return {
        success: true,
        data: this.mapMovementToResponse(result.movement),
        message: 'Movement created successfully'
      };
    } catch (error) {
      console.error('Error creating movement:', error);
      return {
        success: false,
        error: 'Failed to create movement'
      };
    }
  }

  async getMovementById(id: string): Promise<ApiResponse<MovementResponse>> {
    try {
      const movement = await this.db.movements.findById(id);
      if (!movement) {
        return {
          success: false,
          error: 'Movement not found'
        };
      }

      return {
        success: true,
        data: this.mapMovementToResponse(movement)
      };
    } catch (error) {
      console.error('Error fetching movement:', error);
      return {
        success: false,
        error: 'Failed to fetch movement'
      };
    }
  }

  async getAllMovements(params?: QueryParams): Promise<ApiResponse<{ movements: MovementResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.movements.findAll(params);
      
      return {
        success: true,
        data: {
          movements: result.data.map(movement => this.mapMovementToResponse(movement)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching movements:', error);
      return {
        success: false,
        error: 'Failed to fetch movements'
      };
    }
  }

  async getMovementsByItem(itemId: string, params?: QueryParams): Promise<ApiResponse<{ movements: MovementResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.movements.getMovementsByItem(itemId, params);
      
      return {
        success: true,
        data: {
          movements: result.data.map(movement => this.mapMovementToResponse(movement)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching movements by item:', error);
      return {
        success: false,
        error: 'Failed to fetch movements by item'
      };
    }
  }

  async getRecentMovements(limit: number = 10): Promise<ApiResponse<MovementResponse[]>> {
    try {
      const movements = await this.db.movements.getRecentMovements(limit);
      
      return {
        success: true,
        data: movements.map(movement => this.mapMovementToResponse(movement))
      };
    } catch (error) {
      console.error('Error fetching recent movements:', error);
      return {
        success: false,
        error: 'Failed to fetch recent movements'
      };
    }
  }

  async getMovementsByType(type: string, params?: QueryParams): Promise<ApiResponse<{ movements: MovementResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.movements.getMovementsByType(type, params);
      
      return {
        success: true,
        data: {
          movements: result.data.map(movement => this.mapMovementToResponse(movement)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching movements by type:', error);
      return {
        success: false,
        error: 'Failed to fetch movements by type'
      };
    }
  }

  async getMovementStats(itemId?: string): Promise<ApiResponse<{
    totalIn: number;
    totalOut: number;
    totalAdjustments: number;
    totalTransfers: number;
    totalReturns: number;
  }>> {
    try {
      const stats = await this.db.movements.getMovementStats(itemId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching movement stats:', error);
      return {
        success: false,
        error: 'Failed to fetch movement stats'
      };
    }
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date, params?: QueryParams): Promise<ApiResponse<{ movements: MovementResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.movements.getMovementsByDateRange(startDate, endDate, params);
      
      return {
        success: true,
        data: {
          movements: result.data.map(movement => this.mapMovementToResponse(movement)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching movements by date range:', error);
      return {
        success: false,
        error: 'Failed to fetch movements by date range'
      };
    }
  }

  async adjustInventory(itemId: string, newQuantity: number, reason: string, userId?: string): Promise<ApiResponse<MovementResponse>> {
    try {
      const item = await this.db.items.findById(itemId);
      if (!item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      const adjustmentData: CreateMovementRequest = {
        itemId,
        type: 'ADJUSTMENT',
        quantity: newQuantity,
        reason,
        notes: `Inventory adjustment from ${item.quantity} to ${newQuantity}`
      };

      return this.createMovement(adjustmentData, userId);
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      return {
        success: false,
        error: 'Failed to adjust inventory'
      };
    }
  }

  private mapMovementToResponse(movement: any): MovementResponse {
    return {
      id: movement.id,
      item: {
        id: movement.item.id,
        name: movement.item.name,
        sku: movement.item.sku
      },
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      reference: movement.reference,
      user: {
        id: movement.user.id,
        firstName: movement.user.firstName,
        lastName: movement.user.lastName,
        email: movement.user.email,
        username: movement.user.username
      },
      notes: movement.notes,
      createdAt: movement.createdAt
    };
  }
}
