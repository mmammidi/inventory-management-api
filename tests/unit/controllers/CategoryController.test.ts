import { Request, Response } from 'express';
import { CategoryController } from '../../../presentation/controllers/CategoryController';
import { CategoryService } from '../../../business/services/CategoryService';
import { mockRequest, mockResponse, createMockCategory } from '../../utils/testHelpers';

// Mock the CategoryService
jest.mock('../../../business/services/CategoryService');
const MockedCategoryService = CategoryService as jest.MockedClass<typeof CategoryService>;

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<CategoryService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockCategoryService = new MockedCategoryService() as jest.Mocked<CategoryService>;
    categoryController = new CategoryController();
    (categoryController as any).categoryService = mockCategoryService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description'
      };

      const mockCategory = createMockCategory(categoryData);
      const mockResponse = {
        success: true,
        data: mockCategory,
        message: 'Category created successfully'
      };

      mockCategoryService.createCategory.mockResolvedValue(mockResponse);
      mockReq.body = categoryData;

      await categoryController.createCategory(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(categoryData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const categoryData = { name: '' }; // Invalid data
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'name', message: 'Name is required' }]
      };

      mockCategoryService.createCategory.mockResolvedValue(mockResponse);
      mockReq.body = categoryData;

      await categoryController.createCategory(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(categoryData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate category name', async () => {
      const categoryData = { name: 'Existing Category' };
      const mockResponse = {
        success: false,
        error: 'Category with this name already exists'
      };

      mockCategoryService.createCategory.mockResolvedValue(mockResponse);
      mockReq.body = categoryData;

      await categoryController.createCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const categoryData = { name: 'Test Category' };
      mockCategoryService.createCategory.mockRejectedValue(new Error('Database error'));

      await categoryController.createCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAllCategories', () => {
    it('should get all categories with default parameters', async () => {
      const mockCategories = [createMockCategory(), createMockCategory()];
      const mockResponse = {
        success: true,
        data: {
          categories: mockCategories,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockCategoryService.getAllCategories.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await categoryController.getAllCategories(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.getAllCategories).toHaveBeenCalledWith({
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

    it('should get categories with query parameters', async () => {
      const mockResponse = { success: true, data: { categories: [], pagination: {} } };
      mockCategoryService.getAllCategories.mockResolvedValue(mockResponse);
      mockReq.query = {
        page: '2',
        limit: '5',
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: JSON.stringify({ isActive: true })
      };

      await categoryController.getAllCategories(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.getAllCategories).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'test',
        filter: { isActive: true }
      });
    });

    it('should handle service errors', async () => {
      mockCategoryService.getAllCategories.mockRejectedValue(new Error('Database error'));

      await categoryController.getAllCategories(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getCategoryById', () => {
    it('should get category by ID successfully', async () => {
      const mockCategory = createMockCategory();
      const mockResponse = {
        success: true,
        data: mockCategory
      };

      mockCategoryService.getCategoryById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };

      await categoryController.getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('category-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle category not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Category not found'
      };

      mockCategoryService.getCategoryById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await categoryController.getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockCategoryService.getCategoryById.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'category-id' };

      await categoryController.getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = { name: 'Updated Category' };
      const mockCategory = createMockCategory(updateData);
      const mockResponse = {
        success: true,
        data: mockCategory,
        message: 'Category updated successfully'
      };

      mockCategoryService.updateCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };
      mockReq.body = updateData;

      await categoryController.updateCategory(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith('category-id', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle category not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Category not found'
      };

      mockCategoryService.updateCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { name: 'Updated' };

      await categoryController.updateCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Validation failed'
      };

      mockCategoryService.updateCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };
      mockReq.body = { name: '' };

      await categoryController.updateCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate name on update', async () => {
      const mockResponse = {
        success: false,
        error: 'Category with this name already exists'
      };

      mockCategoryService.updateCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };
      mockReq.body = { name: 'Existing Name' };

      await categoryController.updateCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Category deleted successfully'
      };

      mockCategoryService.deleteCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };

      await categoryController.deleteCategory(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith('category-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle category not found', async () => {
      const mockResponse = {
        success: false,
        error: 'Category not found'
      };

      mockCategoryService.deleteCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await categoryController.deleteCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle category with items', async () => {
      const mockResponse = {
        success: false,
        error: 'Cannot delete category with existing items'
      };

      mockCategoryService.deleteCategory.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'category-id' };

      await categoryController.deleteCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getCategoryStats', () => {
    it('should get category statistics successfully', async () => {
      const mockStats = {
        totalCategories: 10,
        activeCategories: 8,
        inactiveCategories: 2,
        categoriesWithItems: 5
      };
      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockCategoryService.getCategoryStats.mockResolvedValue(mockResponse);

      await categoryController.getCategoryStats(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.getCategoryStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockCategoryService.getCategoryStats.mockRejectedValue(new Error('Database error'));

      await categoryController.getCategoryStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

describe.skip('getActiveCategories', () => {
    it('should get active categories successfully', async () => {
      const mockCategories = [createMockCategory({ isActive: true })];
      const mockResponse = {
        success: true,
        data: { categories: mockCategories }
      };

      mockCategoryService.getActiveCategories.mockResolvedValue(mockResponse);

      await categoryController.getActiveCategories(mockReq as Request, mockRes as Response);

      expect(mockCategoryService.getActiveCategories).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockCategoryService.getActiveCategories.mockRejectedValue(new Error('Database error'));

      await categoryController.getActiveCategories(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
