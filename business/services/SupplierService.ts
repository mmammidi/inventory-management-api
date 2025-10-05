import Database from '@/data/models/Database';
import { 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierResponse, 
  QueryParams,
  ApiResponse,
  PaginationInfo
} from '@/types';
import { Supplier } from '@prisma/client';

export class SupplierService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async createSupplier(data: CreateSupplierRequest): Promise<ApiResponse<SupplierResponse>> {
    try {
      // Check if supplier name already exists
      const existingSupplier = await this.db.suppliers.findByName(data.name);
      if (existingSupplier) {
        return {
          success: false,
          error: 'Supplier with this name already exists'
        };
      }

      // Check if email already exists (if provided)
      if (data.email) {
        const existingEmail = await this.db.suppliers.findByEmail(data.email);
        if (existingEmail) {
          return {
            success: false,
            error: 'Supplier with this email already exists'
          };
        }
      }

      const supplier = await this.db.suppliers.create(data);
      
      return {
        success: true,
        data: this.mapSupplierToResponse(supplier),
        message: 'Supplier created successfully'
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      return {
        success: false,
        error: 'Failed to create supplier'
      };
    }
  }

  async getSupplierById(id: string): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.db.suppliers.findById(id);
      if (!supplier) {
        return {
          success: false,
          error: 'Supplier not found'
        };
      }

      return {
        success: true,
        data: this.mapSupplierToResponse(supplier)
      };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return {
        success: false,
        error: 'Failed to fetch supplier'
      };
    }
  }

  async getAllSuppliers(params?: QueryParams): Promise<ApiResponse<{ suppliers: SupplierResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.suppliers.findAll(params);
      
      return {
        success: true,
        data: {
          suppliers: result.data.map(supplier => this.mapSupplierToResponse(supplier)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return {
        success: false,
        error: 'Failed to fetch suppliers'
      };
    }
  }

  async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<ApiResponse<SupplierResponse>> {
    try {
      // Check if supplier exists
      const existingSupplier = await this.db.suppliers.findById(id);
      if (!existingSupplier) {
        return {
          success: false,
          error: 'Supplier not found'
        };
      }

      // Check if new name already exists (if provided)
      if (data.name && data.name !== existingSupplier.name) {
        const nameExists = await this.db.suppliers.findByName(data.name);
        if (nameExists) {
          return {
            success: false,
            error: 'Supplier with this name already exists'
          };
        }
      }

      // Check if new email already exists (if provided)
      if (data.email && data.email !== existingSupplier.email) {
        const emailExists = await this.db.suppliers.findByEmail(data.email);
        if (emailExists) {
          return {
            success: false,
            error: 'Supplier with this email already exists'
          };
        }
      }

      const updatedSupplier = await this.db.suppliers.update(id, data);
      
      return {
        success: true,
        data: this.mapSupplierToResponse(updatedSupplier),
        message: 'Supplier updated successfully'
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      return {
        success: false,
        error: 'Failed to update supplier'
      };
    }
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    try {
      const supplier = await this.db.suppliers.findById(id);
      if (!supplier) {
        return {
          success: false,
          error: 'Supplier not found'
        };
      }

      await this.db.suppliers.delete(id);
      
      return {
        success: true,
        message: 'Supplier deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      if (error instanceof Error && error.message.includes('existing items')) {
        return {
          success: false,
          error: 'Cannot delete supplier with existing items'
        };
      }
      return {
        success: false,
        error: 'Failed to delete supplier'
      };
    }
  }

  async getAllSuppliersList(): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const suppliers = await this.db.suppliers.getAllSuppliers();
      
      return {
        success: true,
        data: suppliers.map(supplier => this.mapSupplierToResponse(supplier))
      };
    } catch (error) {
      console.error('Error fetching suppliers list:', error);
      return {
        success: false,
        error: 'Failed to fetch suppliers list'
      };
    }
  }

  async getActiveSuppliers(): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const suppliers = await this.db.suppliers.getActiveSuppliers();
      
      return {
        success: true,
        data: suppliers.map(supplier => this.mapSupplierToResponse(supplier))
      };
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      return {
        success: false,
        error: 'Failed to fetch active suppliers'
      };
    }
  }

  private mapSupplierToResponse(supplier: any): SupplierResponse {
    return {
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      country: supplier.country,
      zipCode: supplier.zipCode,
      status: supplier.status,
      itemCount: supplier._count?.items || 0,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    };
  }
}
