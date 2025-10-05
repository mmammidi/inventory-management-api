// Common types and interfaces for the inventory management system

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// Item related types
export interface CreateItemRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  categoryId: string;
  supplierId?: string;
  location?: string;
  notes?: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  minQuantity?: number;
  maxQuantity?: number;
  unit?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  categoryId?: string;
  supplierId?: string;
  location?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
}

export interface ItemResponse {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  status: string;
  category: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category related types
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier related types
export interface CreateSupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface SupplierResponse {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Movement related types
export interface CreateMovementRequest {
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
  quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
}

export interface MovementResponse {
  id: string;
  item: {
    id: string;
    name: string;
    sku: string;
  };
  type: string;
  quantity: number;
  reason?: string;
  reference?: string;
  userId?: string;
  notes?: string;
  createdAt: Date;
}

// User related types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}

// Dashboard and analytics types
export interface DashboardStats {
  totalItems: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentMovements: MovementResponse[];
  topCategories: Array<{
    category: string;
    itemCount: number;
  }>;
}

export interface InventoryReport {
  itemId: string;
  itemName: string;
  sku: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity?: number;
  status: string;
  lastMovement?: Date;
  totalIn: number;
  totalOut: number;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
