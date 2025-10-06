import { Request, Response } from 'express';
import { SupplierController } from '../../../presentation/controllers/SupplierController';
import { SupplierService } from '../../../business/services/SupplierService';
import { mockRequest, mockResponse, createMockSupplier } from '../../utils/testHelpers';

// Mock the SupplierService
jest.mock('../../../business/services/SupplierService');
const MockedSupplierService = SupplierService as jest.MockedClass<typeof SupplierService>;

describe('SupplierController', () => {
  let supplierController: SupplierController;
  let mockSupplierService: jest.Mocked<SupplierService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockSupplierService = new MockedSupplierService() as jest.Mocked<SupplierService>;
    supplierController = new SupplierController();
    (supplierController as any).supplierService = mockSupplierService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const supplierData = {
        name: 'Test Supplier',
        contactName: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      };

      const mockSupplier = createMockSupplier(supplierData);
      const mockResponse = {
        success: true,
        data: mockSupplier,
        message: 'Supplier created successfully'
      };

      mockSupplierService.createSupplier.mockResolvedValue(mockResponse);
      mockReq.body = supplierData;

      await supplierController.createSupplier(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.createSupplier).toHaveBeenCalledWith(supplierData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const supplierData = { name: '' }; // Invalid data
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'name', message: 'Name is required' }]
      };

      mockSupplierService.createSupplier.mockResolvedValue(mockResponse);
      mockReq.body = supplierData;

      await supplierController.createSupplier(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.createSupplier).toHaveBeenCalledWith(supplierData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate supplier name', async () => {
      const supplierData = { name: 'Existing Supplier' };
      const mockResponse = {
        success: false,
        error: 'Supplier with this name already exists'
      };

      mockSupplierService.createSupplier.mockResolvedValue(mockResponse);
      mockReq.body = supplierData;

      await supplierController.createSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const supplierData = { name: 'Test Supplier' };
      mockSupplierService.createSupplier.mockRejectedValue(new Error('Database error'));

      await supplierController.createSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers with default parameters', async () => {
      const mockSuppliers = [createMockSupplier(), createMockSupplier()];
      const mockResponse = {
        success: true,
        data: {
          suppliers: mockSuppliers,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockSupplierService.getAllSuppliers.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await supplierController.getAllSuppliers(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.getAllSuppliers).toHaveBeenCalledWith({
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

    it('should get suppliers with query parameters', async () => {
      const mockResponse = { success: true, data: { suppliers: [], pagination: {} } };
      mockSupplierService.getAllSuppliers.mockResolvedValue(mockResponse);
      mockReq.query = {
        page: '2',
        limit: '5',
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: JSON.stringify({ isActive: true })
      };

      await supplierController.getAllSuppliers(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.getAllSuppliers).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: { isActive: true }
      });
    });

    it('should handle service errors', async () => {
      mockSupplierService.getAllSuppliers.mockRejectedValue(new Error('Database error'));

      await supplierController.getAllSuppliers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getSupplierById', () => {
    it('should get supplier by ID successfully', async () => {
      const mockSupplier = createMockSupplier();
      const mockResponse = {
        success: true,
        data: mockSupplier
      };

      mockSupplierService.getSupplierById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };

      await supplierController.getSupplierById(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.getSupplierById).toHaveBeenCalledWith('supplier-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle supplier not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Supplier not found'
      };

      mockSupplierService.getSupplierById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await supplierController.getSupplierById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockSupplierService.getSupplierById.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'supplier-id' };

      await supplierController.getSupplierById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('updateSupplier', () => {
    it('should update supplier successfully', async () => {
      const updateData = { name: 'Updated Supplier' };
      const mockSupplier = createMockSupplier(updateData);
      const mockResponse = {
        success: true,
        data: mockSupplier,
        message: 'Supplier updated successfully'
      };

      mockSupplierService.updateSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };
      mockReq.body = updateData;

      await supplierController.updateSupplier(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.updateSupplier).toHaveBeenCalledWith('supplier-id', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle supplier not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Supplier not found'
      };

      mockSupplierService.updateSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { name: 'Updated' };

      await supplierController.updateSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Validation failed'
      };

      mockSupplierService.updateSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };
      mockReq.body = { name: '' };

      await supplierController.updateSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate name on update', async () => {
      const mockResponse = {
        success: false,
        error: 'Supplier with this name already exists'
      };

      mockSupplierService.updateSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };
      mockReq.body = { name: 'Existing Name' };

      await supplierController.updateSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Supplier deleted successfully'
      };

      mockSupplierService.deleteSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };

      await supplierController.deleteSupplier(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.deleteSupplier).toHaveBeenCalledWith('supplier-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle supplier not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Supplier not found'
      };

      mockSupplierService.deleteSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await supplierController.deleteSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle supplier with items', async () => {
      const mockResponse = {
        success: false,
        error: 'Cannot delete supplier with existing items'
      };

      mockSupplierService.deleteSupplier.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'supplier-id' };

      await supplierController.deleteSupplier(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe.skip('getSupplierStats', () => {
    it('should get supplier statistics successfully', async () => {
      const mockStats = {
        totalSuppliers: 10,
        activeSuppliers: 8,
        inactiveSuppliers: 2,
        suppliersWithItems: 5
      };
      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockSupplierService.getSupplierStats.mockResolvedValue(mockResponse);

      await supplierController.getSupplierStats(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.getSupplierStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockSupplierService.getSupplierStats.mockRejectedValue(new Error('Database error'));

      await supplierController.getSupplierStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getActiveSuppliers', () => {
    it('should get active suppliers successfully', async () => {
      const mockSuppliers = [createMockSupplier({ isActive: true })];
      const mockResponse = {
        success: true,
        data: { suppliers: mockSuppliers }
      };

      mockSupplierService.getActiveSuppliers.mockResolvedValue(mockResponse);

      await supplierController.getActiveSuppliers(mockReq as Request, mockRes as Response);

      expect(mockSupplierService.getActiveSuppliers).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockSupplierService.getActiveSuppliers.mockRejectedValue(new Error('Database error'));

      await supplierController.getActiveSuppliers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
