import { Request, Response } from 'express';
import { MovementController } from '../../../presentation/controllers/MovementController';
import { MovementService } from '../../../business/services/MovementService';
import { mockRequest, mockResponse, createMockMovement } from '../../utils/testHelpers';

// Mock the MovementService
jest.mock('../../../business/services/MovementService');
const MockedMovementService = MovementService as jest.MockedClass<typeof MovementService>;

describe('MovementController', () => {
  let movementController: MovementController;
  let mockMovementService: jest.Mocked<MovementService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockMovementService = new MockedMovementService() as jest.Mocked<MovementService>;
    movementController = new MovementController();
    (movementController as any).movementService = mockMovementService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovement', () => {
    it('should create movement successfully', async () => {
      const movementData = {
        itemId: 'item-id',
        type: 'IN',
        quantity: 10,
        reason: 'Stock replenishment',
        reference: 'REF-001',
        notes: 'Initial stock'
      };

      const mockMovement = createMockMovement(movementData);
      const mockResponse = {
        success: true,
        data: mockMovement,
        message: 'Movement created successfully'
      };

      mockMovementService.createMovement.mockResolvedValue(mockResponse);
      mockReq.body = movementData;

      await movementController.createMovement(mockReq as Request, mockRes as Response);

      expect(mockMovementService.createMovement).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const movementData = { type: 'INVALID_TYPE' }; // Invalid data
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'type', message: 'Invalid movement type' }]
      };

      mockMovementService.createMovement.mockResolvedValue(mockResponse);
      mockReq.body = movementData;

      await movementController.createMovement(mockReq as Request, mockRes as Response);

      expect(mockMovementService.createMovement).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const movementData = {
        itemId: 'non-existent-item',
        type: 'IN',
        quantity: 10
      };
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      mockMovementService.createMovement.mockResolvedValue(mockResponse);
      mockReq.body = movementData;

      await movementController.createMovement(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle insufficient stock for OUT movement', async () => {
      const movementData = {
        itemId: 'item-id',
        type: 'OUT',
        quantity: 1000 // More than available
      };
      const mockResponse = {
        success: false,
        error: 'Insufficient stock'
      };

      mockMovementService.createMovement.mockResolvedValue(mockResponse);
      mockReq.body = movementData;

      await movementController.createMovement(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const movementData = {
        itemId: 'item-id',
        type: 'IN',
        quantity: 10
      };
      mockMovementService.createMovement.mockRejectedValue(new Error('Database error'));

      await movementController.createMovement(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAllMovements', () => {
    it('should get all movements with default parameters', async () => {
      const mockMovements = [createMockMovement(), createMockMovement()];
      const mockResponse = {
        success: true,
        data: {
          movements: mockMovements,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockMovementService.getAllMovements.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await movementController.getAllMovements(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getAllMovements).toHaveBeenCalledWith({
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

    it('should get movements with query parameters', async () => {
      const mockResponse = { success: true, data: { movements: [], pagination: {} } };
      mockMovementService.getAllMovements.mockResolvedValue(mockResponse);
      mockReq.query = {
        page: '2',
        limit: '5',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'REF-001',
        filter: JSON.stringify({ type: 'IN' })
      };

      await movementController.getAllMovements(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getAllMovements).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'REF-001',
        filter: { type: 'IN' }
      });
    });

    it('should handle service errors', async () => {
      mockMovementService.getAllMovements.mockRejectedValue(new Error('Database error'));

      await movementController.getAllMovements(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementById', () => {
    it('should get movement by ID successfully', async () => {
      const mockMovement = createMockMovement();
      const mockResponse = {
        success: true,
        data: mockMovement
      };

      mockMovementService.getMovementById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'movement-id' };

      await movementController.getMovementById(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getMovementById).toHaveBeenCalledWith('movement-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle movement not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Movement not found'
      };

      mockMovementService.getMovementById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await movementController.getMovementById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockMovementService.getMovementById.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'movement-id' };

      await movementController.getMovementById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementsByItem', () => {
    it('should get movements by item ID successfully', async () => {
      const mockMovements = [createMockMovement(), createMockMovement()];
      const mockResponse = {
        success: true,
        data: { movements: mockMovements }
      };

      mockMovementService.getMovementsByItem.mockResolvedValue(mockResponse);
      mockReq.params = { itemId: 'item-id' };

      await movementController.getMovementsByItem(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getMovementsByItem).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle item not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Item not found'
      };

      mockMovementService.getMovementsByItem.mockResolvedValue(mockResponse);
      mockReq.params = { itemId: 'non-existent-item' };

      await movementController.getMovementsByItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockMovementService.getMovementsByItem.mockRejectedValue(new Error('Database error'));
      mockReq.params = { itemId: 'item-id' };

      await movementController.getMovementsByItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getRecentMovements', () => {
    it('should get recent movements successfully', async () => {
      const mockMovements = [createMockMovement(), createMockMovement()];
      const mockResponse = {
        success: true,
        data: { movements: mockMovements }
      };

      mockMovementService.getRecentMovements.mockResolvedValue(mockResponse);
      mockReq.query = { limit: '5' };

      await movementController.getRecentMovements(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getRecentMovements).toHaveBeenCalledWith(5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should use default limit when not provided', async () => {
      const mockResponse = { success: true, data: { movements: [] } };
      mockMovementService.getRecentMovements.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await movementController.getRecentMovements(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getRecentMovements).toHaveBeenCalledWith(10);
    });

    it('should handle service errors', async () => {
      mockMovementService.getRecentMovements.mockRejectedValue(new Error('Database error'));

      await movementController.getRecentMovements(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementsByType', () => {
    it('should get movements by type successfully', async () => {
      const mockMovements = [createMockMovement({ type: 'IN' })];
      const mockResponse = {
        success: true,
        data: { movements: mockMovements }
      };

      mockMovementService.getMovementsByType.mockResolvedValue(mockResponse);
      mockReq.params = { type: 'IN' };

      await movementController.getMovementsByType(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getMovementsByType).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid movement type', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid movement type'
      };

      mockMovementService.getMovementsByType.mockResolvedValue(mockResponse);
      mockReq.params = { type: 'INVALID' };

      await movementController.getMovementsByType(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockMovementService.getMovementsByType.mockRejectedValue(new Error('Database error'));
      mockReq.params = { type: 'IN' };

      await movementController.getMovementsByType(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementsByDateRange', () => {
    it('should get movements by date range successfully', async () => {
      const mockMovements = [createMockMovement()];
      const mockResponse = {
        success: true,
        data: { movements: mockMovements }
      };

      mockMovementService.getMovementsByDateRange.mockResolvedValue(mockResponse);
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await movementController.getMovementsByDateRange(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getMovementsByDateRange).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing date parameters', async () => {
      const mockResponse = {
        success: false,
        error: 'Start date and end date are required'
      };

      mockMovementService.getMovementsByDateRange.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await movementController.getMovementsByDateRange(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid date format', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid date format'
      };

      mockMovementService.getMovementsByDateRange.mockResolvedValue(mockResponse);
      mockReq.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      await movementController.getMovementsByDateRange(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockMovementService.getMovementsByDateRange.mockRejectedValue(new Error('Database error'));
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await movementController.getMovementsByDateRange(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementStats', () => {
    it('should get movement statistics successfully', async () => {
      const mockStats = {
        totalMovements: 100,
        inMovements: 60,
        outMovements: 35,
        adjustmentMovements: 5,
        totalQuantityIn: 1000,
        totalQuantityOut: 500
      };
      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockMovementService.getMovementStats.mockResolvedValue(mockResponse);

      await movementController.getMovementStats(mockReq as Request, mockRes as Response);

      expect(mockMovementService.getMovementStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockMovementService.getMovementStats.mockRejectedValue(new Error('Database error'));

      await movementController.getMovementStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
