import { Request, Response } from 'express';
import { DashboardController } from '../../../presentation/controllers/DashboardController';
import { DashboardService } from '../../../business/services/DashboardService';
import { mockRequest, mockResponse } from '../../utils/testHelpers';

// Mock the DashboardService
jest.mock('../../../business/services/DashboardService');
const MockedDashboardService = DashboardService as jest.MockedClass<typeof DashboardService>;

describe.skip('DashboardController', () => {
  let dashboardController: DashboardController;
  let mockDashboardService: jest.Mocked<DashboardService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockDashboardService = new MockedDashboardService() as jest.Mocked<DashboardService>;
    dashboardController = new DashboardController();
    (dashboardController as any).dashboardService = mockDashboardService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should get dashboard statistics successfully', async () => {
      const mockStats = {
        totalItems: 100,
        totalCategories: 10,
        totalSuppliers: 5,
        totalUsers: 8,
        totalMovements: 250,
        lowStockItems: 5,
        outOfStockItems: 2,
        totalInventoryValue: 50000,
        recentMovements: [
          {
            id: 'movement-1',
            type: 'IN',
            quantity: 10,
            item: { name: 'Test Item', sku: 'TEST-001' },
            user: { firstName: 'John', lastName: 'Doe' },
            createdAt: new Date()
          }
        ],
        topItems: [
          {
            id: 'item-1',
            name: 'Popular Item',
            sku: 'POP-001',
            quantity: 100,
            totalMovements: 25
          }
        ],
        categoryStats: [
          {
            categoryId: 'cat-1',
            categoryName: 'Electronics',
            itemCount: 20,
            totalValue: 20000
          }
        ],
        supplierStats: [
          {
            supplierId: 'sup-1',
            supplierName: 'Tech Corp',
            itemCount: 15,
            totalValue: 15000
          }
        ]
      };

      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockDashboardService.getDashboardStats.mockResolvedValue(mockResponse);

      await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getDashboardStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockDashboardService.getDashboardStats.mockRejectedValue(new Error('Database error'));

      await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getInventoryOverview', () => {
    it('should get inventory overview successfully', async () => {
      const mockOverview = {
        totalItems: 100,
        totalValue: 50000,
        totalCost: 30000,
        lowStockItems: 5,
        outOfStockItems: 2,
        categoryBreakdown: [
          {
            categoryId: 'cat-1',
            categoryName: 'Electronics',
            itemCount: 20,
            totalValue: 20000,
            percentage: 40
          },
          {
            categoryId: 'cat-2',
            categoryName: 'Clothing',
            itemCount: 30,
            totalValue: 15000,
            percentage: 30
          }
        ],
        supplierBreakdown: [
          {
            supplierId: 'sup-1',
            supplierName: 'Tech Corp',
            itemCount: 15,
            totalValue: 15000,
            percentage: 30
          }
        ]
      };

      const mockResponse = {
        success: true,
        data: mockOverview
      };

      mockDashboardService.getInventoryOverview.mockResolvedValue(mockResponse);

      await dashboardController.getInventoryOverview(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getInventoryOverview).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockDashboardService.getInventoryOverview.mockRejectedValue(new Error('Database error'));

      await dashboardController.getInventoryOverview(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getMovementAnalytics', () => {
    it('should get movement analytics successfully', async () => {
      const mockAnalytics = {
        totalMovements: 250,
        inMovements: 150,
        outMovements: 80,
        adjustmentMovements: 20,
        totalQuantityIn: 1000,
        totalQuantityOut: 500,
        movementTrends: [
          {
            date: '2024-01-01',
            inMovements: 10,
            outMovements: 5,
            netQuantity: 5
          }
        ],
        topItemsByMovement: [
          {
            itemId: 'item-1',
            itemName: 'Popular Item',
            sku: 'POP-001',
            totalMovements: 25,
            inMovements: 15,
            outMovements: 10
          }
        ],
        movementTypes: {
          IN: 150,
          OUT: 80,
          ADJUSTMENT: 20
        }
      };

      const mockResponse = {
        success: true,
        data: mockAnalytics
      };

      mockDashboardService.getMovementAnalytics.mockResolvedValue(mockResponse);

      await dashboardController.getMovementAnalytics(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getMovementAnalytics).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should get movement analytics with date range', async () => {
      const mockResponse = { success: true, data: {} };
      mockDashboardService.getMovementAnalytics.mockResolvedValue(mockResponse);
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await dashboardController.getMovementAnalytics(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getMovementAnalytics).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('should handle service errors', async () => {
      mockDashboardService.getMovementAnalytics.mockRejectedValue(new Error('Database error'));

      await dashboardController.getMovementAnalytics(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAlerts', () => {
    it('should get alerts successfully', async () => {
      const mockAlerts = {
        lowStockAlerts: [
          {
            itemId: 'item-1',
            itemName: 'Low Stock Item',
            sku: 'LOW-001',
            currentQuantity: 5,
            minQuantity: 10,
            categoryName: 'Electronics'
          }
        ],
        outOfStockAlerts: [
          {
            itemId: 'item-2',
            itemName: 'Out of Stock Item',
            sku: 'OUT-001',
            currentQuantity: 0,
            minQuantity: 5,
            categoryName: 'Clothing'
          }
        ],
        recentMovements: [
          {
            id: 'movement-1',
            type: 'OUT',
            quantity: 50,
            item: { name: 'High Volume Item', sku: 'HIGH-001' },
            user: { firstName: 'Jane', lastName: 'Smith' },
            createdAt: new Date()
          }
        ],
        systemAlerts: [
          {
            type: 'WARNING',
            message: 'High number of adjustments detected',
            timestamp: new Date()
          }
        ]
      };

      const mockResponse = {
        success: true,
        data: mockAlerts
      };

      mockDashboardService.getAlerts.mockResolvedValue(mockResponse);

      await dashboardController.getAlerts(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getAlerts).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockDashboardService.getAlerts.mockRejectedValue(new Error('Database error'));

      await dashboardController.getAlerts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should get performance metrics successfully', async () => {
      const mockMetrics = {
        inventoryTurnover: 4.5,
        averageStockValue: 500,
        stockAccuracy: 98.5,
        movementFrequency: 2.5,
        topPerformingCategories: [
          {
            categoryId: 'cat-1',
            categoryName: 'Electronics',
            turnoverRate: 6.2,
            totalValue: 20000
          }
        ],
        topPerformingSuppliers: [
          {
            supplierId: 'sup-1',
            supplierName: 'Tech Corp',
            itemCount: 15,
            averageDeliveryTime: 2.5,
            reliability: 95
          }
        ],
        monthlyTrends: [
          {
            month: '2024-01',
            totalMovements: 100,
            inventoryValue: 45000,
            turnoverRate: 4.2
          }
        ]
      };

      const mockResponse = {
        success: true,
        data: mockMetrics
      };

      mockDashboardService.getPerformanceMetrics.mockResolvedValue(mockResponse);

      await dashboardController.getPerformanceMetrics(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getPerformanceMetrics).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should get performance metrics with date range', async () => {
      const mockResponse = { success: true, data: {} };
      mockDashboardService.getPerformanceMetrics.mockResolvedValue(mockResponse);
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      await dashboardController.getPerformanceMetrics(mockReq as Request, mockRes as Response);

      expect(mockDashboardService.getPerformanceMetrics).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-12-31'
      );
    });

    it('should handle service errors', async () => {
      mockDashboardService.getPerformanceMetrics.mockRejectedValue(new Error('Database error'));

      await dashboardController.getPerformanceMetrics(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
