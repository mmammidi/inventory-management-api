import { CategoryService } from '@/business/services/CategoryService';
import Database from '@/data/models/Database';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

// Mock the Database class
jest.mock('@/data/models/Database');

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockDatabase: jest.Mocked<Database>;
  let mockCategories: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock database instance
    mockDatabase = {
      categories: {
        create: jest.fn(),
        findById: jest.fn(),
        findByName: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getAllCategories: jest.fn(),
        getCategoryStats: jest.fn()
      }
    } as any;

    // Mock the Database.getInstance method
    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabase);

    // Create service instance
    categoryService = new CategoryService();

    // Get reference to mocked categories
    mockCategories = mockDatabase.categories;
  });

  describe('createCategory', () => {
    const validCategoryData: CreateCategoryRequest = {
      name: 'Electronics',
      description: 'Electronic items'
    };

    it('should create a category successfully', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategories.findByName.mockResolvedValue(null);
      mockCategories.create.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.createCategory(validCategoryData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        itemCount: 0,
        createdAt: mockCategory.createdAt,
        updatedAt: mockCategory.updatedAt
      });
      expect(result.message).toBe('Category created successfully');
      expect(mockCategories.findByName).toHaveBeenCalledWith('Electronics');
      expect(mockCategories.create).toHaveBeenCalledWith(validCategoryData);
    });

    it('should return error if category name already exists', async () => {
      // Arrange
      const existingCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Existing category'
      };

      mockCategories.findByName.mockResolvedValue(existingCategory);

      // Act
      const result = await categoryService.createCategory(validCategoryData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Category with this name already exists');
      expect(mockCategories.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.findByName.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.createCategory(validCategoryData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create category');
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID successfully', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategories.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById('1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        itemCount: 0,
        createdAt: mockCategory.createdAt,
        updatedAt: mockCategory.updatedAt
      });
      expect(mockCategories.findById).toHaveBeenCalledWith('1');
    });

    it('should return error if category not found', async () => {
      // Arrange
      mockCategories.findById.mockResolvedValue(null);

      // Act
      const result = await categoryService.getCategoryById('999');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Category not found');
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.getCategoryById('1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch category');
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories with pagination', async () => {
      // Arrange
      const mockCategoriesData = [
        {
          id: '1',
          name: 'Electronics',
          description: 'Electronic items',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Clothing',
          description: 'Clothing items',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockResult = {
        data: mockCategoriesData,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      };

      mockCategories.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await categoryService.getAllCategories();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.categories).toHaveLength(2);
      expect(result.data.pagination).toEqual(mockResult.pagination);
      expect(mockCategories.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.getAllCategories();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch categories');
    });
  });

  describe('updateCategory', () => {
    const updateData: UpdateCategoryRequest = {
      name: 'Updated Electronics',
      description: 'Updated description'
    };

    it('should update category successfully', async () => {
      // Arrange
      const existingCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'Updated Electronics',
        description: 'Updated description'
      };

      mockCategories.findById.mockResolvedValueOnce(existingCategory);
      mockCategories.findByName.mockResolvedValue(null);
      mockCategories.update.mockResolvedValue(updatedCategory);

      // Act
      const result = await categoryService.updateCategory('1', updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Electronics');
      expect(result.message).toBe('Category updated successfully');
      expect(mockCategories.findById).toHaveBeenCalledWith('1');
      expect(mockCategories.findByName).toHaveBeenCalledWith('Updated Electronics');
      expect(mockCategories.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should return error if category not found', async () => {
      // Arrange
      mockCategories.findById.mockResolvedValue(null);

      // Act
      const result = await categoryService.updateCategory('999', updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Category not found');
      expect(mockCategories.update).not.toHaveBeenCalled();
    });

    it('should return error if new name already exists', async () => {
      // Arrange
      const existingCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items'
      };

      const conflictingCategory = {
        id: '2',
        name: 'Updated Electronics',
        description: 'Another category'
      };

      mockCategories.findById.mockResolvedValue(existingCategory);
      mockCategories.findByName.mockResolvedValue(conflictingCategory);

      // Act
      const result = await categoryService.updateCategory('1', updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Category with this name already exists');
      expect(mockCategories.update).not.toHaveBeenCalled();
    });

    it('should allow updating with same name', async () => {
      // Arrange
      const existingCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updateDataSameName: UpdateCategoryRequest = {
        name: 'Electronics', // Same name
        description: 'Updated description'
      };

      const updatedCategory = {
        ...existingCategory,
        description: 'Updated description'
      };

      mockCategories.findById.mockResolvedValue(existingCategory);
      mockCategories.update.mockResolvedValue(updatedCategory);

      // Act
      const result = await categoryService.updateCategory('1', updateDataSameName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.description).toBe('Updated description');
      expect(mockCategories.findByName).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.updateCategory('1', updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update category');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items'
      };

      mockCategories.findById.mockResolvedValue(mockCategory);
      mockCategories.delete.mockResolvedValue(undefined);

      // Act
      const result = await categoryService.deleteCategory('1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Category deleted successfully');
      expect(mockCategories.findById).toHaveBeenCalledWith('1');
      expect(mockCategories.delete).toHaveBeenCalledWith('1');
    });

    it('should return error if category not found', async () => {
      // Arrange
      mockCategories.findById.mockResolvedValue(null);

      // Act
      const result = await categoryService.deleteCategory('999');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Category not found');
      expect(mockCategories.delete).not.toHaveBeenCalled();
    });

    it('should handle constraint errors for categories with items', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items'
      };

      mockCategories.findById.mockResolvedValue(mockCategory);
      mockCategories.delete.mockRejectedValue(new Error('Cannot delete category with existing items'));

      // Act
      const result = await categoryService.deleteCategory('1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete category with existing items');
    });

    it('should handle general database errors', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items'
      };

      mockCategories.findById.mockResolvedValue(mockCategory);
      mockCategories.delete.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.deleteCategory('1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete category');
    });
  });

  describe('getAllCategoriesList', () => {
    it('should return all categories list successfully', async () => {
      // Arrange
      const mockCategoriesData = [
        {
          id: '1',
          name: 'Electronics',
          description: 'Electronic items',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Clothing',
          description: 'Clothing items',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockCategories.getAllCategories.mockResolvedValue(mockCategoriesData);

      // Act
      const result = await categoryService.getAllCategoriesList();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockCategories.getAllCategories).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.getAllCategories.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.getAllCategoriesList();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch categories list');
    });
  });

  describe('getCategoryStats', () => {
    it('should return category statistics successfully', async () => {
      // Arrange
      const mockStats = [
        { category: 'Electronics', itemCount: 15 },
        { category: 'Clothing', itemCount: 8 },
        { category: 'Books', itemCount: 3 }
      ];

      mockCategories.getCategoryStats.mockResolvedValue(mockStats);

      // Act
      const result = await categoryService.getCategoryStats();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(mockCategories.getCategoryStats).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockCategories.getCategoryStats.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await categoryService.getCategoryStats();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch category stats');
    });
  });

  describe('mapCategoryToResponse', () => {
    it('should map category with item count correctly', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { items: 5 }
      };

      mockCategories.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById('1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.itemCount).toBe(5);
    });

    it('should map category without item count correctly', async () => {
      // Arrange
      const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategories.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById('1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.itemCount).toBe(0);
    });
  });
});
