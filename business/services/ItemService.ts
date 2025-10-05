import Database from '@/data/models/Database';
import { 
  CreateItemRequest, 
  UpdateItemRequest, 
  ItemResponse, 
  QueryParams,
  ApiResponse,
  PaginationInfo
} from '@/types';
import { Item, Prisma } from '@prisma/client';

export class ItemService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async createItem(data: CreateItemRequest): Promise<ApiResponse<ItemResponse>> {
    try {
      // Check if SKU already exists
      const existingItem = await this.db.items.findBySku(data.sku);
      if (existingItem) {
        return {
          success: false,
          error: 'Item with this SKU already exists'
        };
      }

      // Check if barcode already exists (if provided)
      if (data.barcode) {
        const existingBarcode = await this.db.items.findByBarcode(data.barcode);
        if (existingBarcode) {
          return {
            success: false,
            error: 'Item with this barcode already exists'
          };
        }
      }

      // Verify category exists
      const category = await this.db.categories.findById(data.categoryId);
      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      // Verify supplier exists (if provided)
      if (data.supplierId) {
        const supplier = await this.db.suppliers.findById(data.supplierId);
        if (!supplier) {
          return {
            success: false,
            error: 'Supplier not found'
          };
        }
      }

      const item = await this.db.items.create(data);
      
      return {
        success: true,
        data: this.mapItemToResponse(item),
        message: 'Item created successfully'
      };
    } catch (error) {
      console.error('Error creating item:', error);
      return {
        success: false,
        error: 'Failed to create item'
      };
    }
  }

  async getItemById(id: string): Promise<ApiResponse<ItemResponse>> {
    try {
      const item = await this.db.items.findById(id);
      if (!item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      return {
        success: true,
        data: this.mapItemToResponse(item)
      };
    } catch (error) {
      console.error('Error fetching item:', error);
      return {
        success: false,
        error: 'Failed to fetch item'
      };
    }
  }

  async getAllItems(params?: QueryParams): Promise<ApiResponse<{ items: ItemResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.items.findAll(params);
      
      return {
        success: true,
        data: {
          items: result.data.map(item => this.mapItemToResponse(item)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      return {
        success: false,
        error: 'Failed to fetch items'
      };
    }
  }

  async updateItem(id: string, data: UpdateItemRequest): Promise<ApiResponse<ItemResponse>> {
    try {
      // Check if item exists
      const existingItem = await this.db.items.findById(id);
      if (!existingItem) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      // Check if new SKU already exists (if provided)
      if (data.sku && data.sku !== existingItem.sku) {
        const skuExists = await this.db.items.findBySku(data.sku);
        if (skuExists) {
          return {
            success: false,
            error: 'Item with this SKU already exists'
          };
        }
      }

      // Check if new barcode already exists (if provided)
      if (data.barcode && data.barcode !== existingItem.barcode) {
        const barcodeExists = await this.db.items.findByBarcode(data.barcode);
        if (barcodeExists) {
          return {
            success: false,
            error: 'Item with this barcode already exists'
          };
        }
      }

      // Verify category exists (if provided)
      if (data.categoryId) {
        const category = await this.db.categories.findById(data.categoryId);
        if (!category) {
          return {
            success: false,
            error: 'Category not found'
          };
        }
      }

      // Verify supplier exists (if provided)
      if (data.supplierId) {
        const supplier = await this.db.suppliers.findById(data.supplierId);
        if (!supplier) {
          return {
            success: false,
            error: 'Supplier not found'
          };
        }
      }

      const updatedItem = await this.db.items.update(id, data);
      
      return {
        success: true,
        data: this.mapItemToResponse(updatedItem),
        message: 'Item updated successfully'
      };
    } catch (error) {
      console.error('Error updating item:', error);
      return {
        success: false,
        error: 'Failed to update item'
      };
    }
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    try {
      const item = await this.db.items.findById(id);
      if (!item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      await this.db.items.delete(id);
      
      return {
        success: true,
        message: 'Item deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting item:', error);
      return {
        success: false,
        error: 'Failed to delete item'
      };
    }
  }

  async getLowStockItems(): Promise<ApiResponse<ItemResponse[]>> {
    try {
      const items = await this.db.items.findLowStockItems();
      
      return {
        success: true,
        data: items.map(item => this.mapItemToResponse(item))
      };
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return {
        success: false,
        error: 'Failed to fetch low stock items'
      };
    }
  }

  async getOutOfStockItems(): Promise<ApiResponse<ItemResponse[]>> {
    try {
      const items = await this.db.items.findOutOfStockItems();
      
      return {
        success: true,
        data: items.map(item => this.mapItemToResponse(item))
      };
    } catch (error) {
      console.error('Error fetching out of stock items:', error);
      return {
        success: false,
        error: 'Failed to fetch out of stock items'
      };
    }
  }

  async getItemsByCategory(categoryId: string, params?: QueryParams): Promise<ApiResponse<{ items: ItemResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.items.getItemsByCategory(categoryId, params);
      
      return {
        success: true,
        data: {
          items: result.data.map(item => this.mapItemToResponse(item)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching items by category:', error);
      return {
        success: false,
        error: 'Failed to fetch items by category'
      };
    }
  }

  async getItemsBySupplier(supplierId: string, params?: QueryParams): Promise<ApiResponse<{ items: ItemResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.items.getItemsBySupplier(supplierId, params);
      
      return {
        success: true,
        data: {
          items: result.data.map(item => this.mapItemToResponse(item)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching items by supplier:', error);
      return {
        success: false,
        error: 'Failed to fetch items by supplier'
      };
    }
  }

  async getTotalInventoryValue(): Promise<ApiResponse<number>> {
    try {
      const totalValue = await this.db.items.getTotalValue();
      
      return {
        success: true,
        data: totalValue
      };
    } catch (error) {
      console.error('Error calculating total inventory value:', error);
      return {
        success: false,
        error: 'Failed to calculate total inventory value'
      };
    }
  }

  private mapItemToResponse(item: any): ItemResponse {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku,
      barcode: item.barcode,
      price: Number(item.price),
      cost: Number(item.cost),
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      unit: item.unit,
      weight: item.weight ? Number(item.weight) : undefined,
      dimensions: item.dimensions ? JSON.parse(item.dimensions) : undefined,
      status: item.status,
      category: {
        id: item.category.id,
        name: item.category.name
      },
      supplier: item.supplier ? {
        id: item.supplier.id,
        name: item.supplier.name
      } : undefined,
      location: item.location,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
