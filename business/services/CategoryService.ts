import Database from '@/data/models/Database';
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryResponse, 
  QueryParams,
  ApiResponse,
  PaginationInfo
} from '@/types';
import { Category } from '@prisma/client';

export class CategoryService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    try {
      // Check if category name already exists
      const existingCategory = await this.db.categories.findByName(data.name);
      if (existingCategory) {
        return {
          success: false,
          error: 'Category with this name already exists'
        };
      }

      const category = await this.db.categories.create(data);
      
      return {
        success: true,
        data: this.mapCategoryToResponse(category),
        message: 'Category created successfully'
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: 'Failed to create category'
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<CategoryResponse>> {
    try {
      const category = await this.db.categories.findById(id);
      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      return {
        success: true,
        data: this.mapCategoryToResponse(category)
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error: 'Failed to fetch category'
      };
    }
  }

  async getAllCategories(params?: QueryParams): Promise<ApiResponse<{ categories: CategoryResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.categories.findAll(params);
      
      return {
        success: true,
        data: {
          categories: result.data.map(category => this.mapCategoryToResponse(category)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories'
      };
    }
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    try {
      // Check if category exists
      const existingCategory = await this.db.categories.findById(id);
      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      // Check if new name already exists (if provided)
      if (data.name && data.name !== existingCategory.name) {
        const nameExists = await this.db.categories.findByName(data.name);
        if (nameExists) {
          return {
            success: false,
            error: 'Category with this name already exists'
          };
        }
      }

      const updatedCategory = await this.db.categories.update(id, data);
      
      return {
        success: true,
        data: this.mapCategoryToResponse(updatedCategory),
        message: 'Category updated successfully'
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: 'Failed to update category'
      };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      const category = await this.db.categories.findById(id);
      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      await this.db.categories.delete(id);
      
      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error instanceof Error && error.message.includes('existing items')) {
        return {
          success: false,
          error: 'Cannot delete category with existing items'
        };
      }
      return {
        success: false,
        error: 'Failed to delete category'
      };
    }
  }

  async getAllCategoriesList(): Promise<ApiResponse<CategoryResponse[]>> {
    try {
      const categories = await this.db.categories.getAllCategories();
      
      return {
        success: true,
        data: categories.map(category => this.mapCategoryToResponse(category))
      };
    } catch (error) {
      console.error('Error fetching categories list:', error);
      return {
        success: false,
        error: 'Failed to fetch categories list'
      };
    }
  }

  async getCategoryStats(): Promise<ApiResponse<Array<{ category: string; itemCount: number }>>> {
    try {
      const stats = await this.db.categories.getCategoryStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return {
        success: false,
        error: 'Failed to fetch category stats'
      };
    }
  }

  private mapCategoryToResponse(category: any): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      itemCount: category._count?.items || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}
