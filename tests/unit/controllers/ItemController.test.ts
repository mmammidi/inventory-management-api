import { Request, Response } from 'express';
import { ItemController } from '../../../presentation/controllers/ItemController';
import { ItemService } from '../../../business/services/ItemService';
import { mockRequest, mockResponse, createMockItem } from '../../utils/testHelpers';

// Mock the ItemService
jest.mock('../../../business/services/ItemService');
const MockedItemService = ItemService as jest.MockedClass<typeof ItemService>;

describe('ItemController', () => {
  let itemController: ItemController;
  let mockItemService: jest.Mocked<ItemService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockItemService = new MockedItemService() as jest.Mocked<ItemService>;
    itemController = new ItemController();
    (itemController as any).itemService = mockItemService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create item successfully', async () => {
      const itemData = {
        name: 'Test Item',
        description: 'Test description',
        sku: 'TEST-001',
        price: 10.99,
        cost: 5.99,
        quantity: 100,
        categoryId: 'category-id',
        supplierId: 'supplier-id'
      };

      const mockItem = createMockItem(itemData);
      const mockResponse = {
        success: true,
        data: mockItem,
        message: 'Item created successfully'
      };

      mockItemService.createItem.mockResolvedValue(mockResponse);
      mockReq.body = itemData;

      await itemController.createItem(mockReq as Request, mockRes as Response);

      expect(mockItemService.createItem).toHaveBeenCalledWith(itemData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const itemData = { name: '' }; // Invalid data
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'name', message: 'Name is required' }]
      };

      mockItemService.createItem.mockResolvedValue(mockResponse);
      mockReq.body = itemData;

      await itemController.createItem(mockReq as Request, mockRes as Response);

      expect(mockItemService.createItem).toHaveBeenCalledWith(itemData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const itemData = { name: 'Test Item' };
      mockItemService.createItem.mockRejectedValue(new Error('Database error'));

      await itemController.createItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAllItems', () => {
    it('should get all items with default parameters', async () => {
      const mockItems = [createMockItem(), createMockItem()];
      const mockResponse = {
        success: true,
        data: {
          items: mockItems,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockItemService.getAllItems.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await itemController.getAllItems(mockReq as Request, mockRes as Response);

      expect(mockItemService.getAllItems).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: undefined,
        search: undefined,
        filter: {}
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should get items with query parameters', async () => {
      const mockResponse = { success: true, data: { items: [], pagination: {} } };
      mockItemService.getAllItems.mockResolvedValue(mockResponse);
      mockReq.query = {
        page: '2',
        limit: '5',
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: JSON.stringify({ categoryId: 'cat-1' })
      };

      await itemController.getAllItems(mockReq as Request, mockRes as Response);

      expect(mockItemService.getAllItems).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: { categoryId: 'cat-1' }
      });
    });

    it('should handle service errors', async () => {
      mockItemService.getAllItems.mockRejectedValue(new Error('Database error'));

      await itemController.getAllItems(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getItemById', () => {
    it('should get item by ID successfully', async () => {
      const mockItem = createMockItem();
      const mockResponse = {
        success: true,
        data: mockItem
      };

      mockItemService.getItemById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'item-id' };

      await itemController.getItemById(mockReq as Request, mockRes as Response);

      expect(mockItemService.getItemById).toHaveBeenCalledWith('item-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      mockItemService.getItemById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await itemController.getItemById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockItemService.getItemById.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'item-id' };

      await itemController.getItemById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const updateData = { name: 'Updated Item' };
      const mockItem = createMockItem(updateData);
      const mockResponse = {
        success: true,
        data: mockItem,
        message: 'Item updated successfully'
      };

      mockItemService.updateItem.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'item-id' };
      mockReq.body = updateData;

      await itemController.updateItem(mockReq as Request, mockRes as Response);

      expect(mockItemService.updateItem).toHaveBeenCalledWith('item-id', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      mockItemService.updateItem.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { name: 'Updated' };

      await itemController.updateItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Validation failed'
      };

      mockItemService.updateItem.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'item-id' };
      mockReq.body = { price: -10 };

      await itemController.updateItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Item deleted successfully'
      };

      mockItemService.deleteItem.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'item-id' };

      await itemController.deleteItem(mockReq as Request, mockRes as Response);

      expect(mockItemService.deleteItem).toHaveBeenCalledWith('item-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      mockItemService.deleteItem.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await itemController.deleteItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe.skip('adjustItemQuantity', () => {
    it('should adjust item quantity successfully', async () => {
      const adjustData = { quantity: 10, reason: 'Stock adjustment' };
      const mockItem = createMockItem({ quantity: 110 });
      const mockResponse = {
        success: true,
        data: mockItem,
        message: 'Item quantity adjusted successfully'
      };

      (mockItemService as any).adjustItemQuantity = jest.fn().mockResolvedValue(mockResponse);
      mockReq.params = { id: 'item-id' };
      mockReq.body = adjustData;

      await itemController.adjustItemQuantity(mockReq as Request, mockRes as Response);

      expect(mockItemService.adjustItemQuantity).toHaveBeenCalledWith('item-id', adjustData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      (mockItemService as any).adjustItemQuantity = jest.fn().mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { quantity: 10 };

      await itemController.adjustItemQuantity(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getLowStockItems', () => {
    it('should get low stock items successfully', async () => {
      const mockItems = [createMockItem({ quantity: 5, minQuantity: 10 })];
      const mockResponse = {
        success: true,
        data: { items: mockItems }
      };

      mockItemService.getLowStockItems.mockResolvedValue(mockResponse);

      await itemController.getLowStockItems(mockReq as Request, mockRes as Response);

      expect(mockItemService.getLowStockItems).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getOutOfStockItems', () => {
    it('should get out of stock items successfully', async () => {
      const mockItems = [createMockItem({ quantity: 0 })];
      const mockResponse = {
        success: true,
        data: { items: mockItems }
      };

      mockItemService.getOutOfStockItems.mockResolvedValue(mockResponse);

      await itemController.getOutOfStockItems(mockReq as Request, mockRes as Response);

      expect(mockItemService.getOutOfStockItems).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe.skip('getItemStats', () => {
    it('should get item statistics successfully', async () => {
      const mockStats = {
        totalItems: 100,
        totalValue: 10000,
        totalCost: 5000,
        lowStockItems: 5,
        outOfStockItems: 2
      };
      const mockResponse = {
        success: true,
        data: mockStats
      };

      (mockItemService as any).getItemStats = jest.fn().mockResolvedValue(mockResponse);

      await itemController.getItemStats(mockReq as Request, mockRes as Response);

      expect(mockItemService.getItemStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });
});
