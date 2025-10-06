import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Item validation schemas
export const createItemSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000),
  sku: Joi.string().required().min(1).max(100),
  barcode: Joi.string().optional().max(100),
  price: Joi.number().required().min(0),
  cost: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  minQuantity: Joi.number().required().min(0),
  maxQuantity: Joi.number().optional().min(0),
  unit: Joi.string().required().min(1).max(50),
  weight: Joi.number().optional().min(0),
  dimensions: Joi.object({
    length: Joi.number().optional().min(0),
    width: Joi.number().optional().min(0),
    height: Joi.number().optional().min(0)
  }).optional(),
  categoryId: Joi.string().required(),
  supplierId: Joi.string().optional(),
  location: Joi.string().optional().max(255),
  notes: Joi.string().optional().max(1000)
});

export const updateItemSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().max(1000),
  barcode: Joi.string().optional().max(100),
  price: Joi.number().optional().min(0),
  cost: Joi.number().optional().min(0),
  minQuantity: Joi.number().optional().min(0),
  maxQuantity: Joi.number().optional().min(0),
  unit: Joi.string().optional().min(1).max(50),
  weight: Joi.number().optional().min(0),
  categoryId: Joi.string().optional(),
  supplierId: Joi.string().optional(),
  location: Joi.string().optional().max(255),
  notes: Joi.string().optional().max(1000),
  sku: Joi.string().optional().min(1).max(100),
  quantity: Joi.number().optional().min(0),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK').optional()
});

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000)
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().max(1000)
});

// Supplier validation schemas
export const createSupplierSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  contactName: Joi.string().optional().max(255),
  email: Joi.string().optional().email().max(255),
  phone: Joi.string().optional().max(50),
  address: Joi.string().optional().max(500),
  city: Joi.string().optional().max(100),
  state: Joi.string().optional().max(100),
  country: Joi.string().optional().max(100),
  zipCode: Joi.string().optional().max(20)
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  contactName: Joi.string().optional().max(255),
  email: Joi.string().optional().email().max(255),
  phone: Joi.string().optional().max(50),
  address: Joi.string().optional().max(500),
  city: Joi.string().optional().max(100),
  state: Joi.string().optional().max(100),
  country: Joi.string().optional().max(100),
  zipCode: Joi.string().optional().max(20),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional()
});

// Movement validation schemas
export const createMovementSchema = Joi.object({
  itemId: Joi.string().required(),
  type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN').required(),
  quantity: Joi.number().required().min(1),
  reason: Joi.string().optional().max(500),
  reference: Joi.string().optional().max(255),
  notes: Joi.string().optional().max(1000)
});

export const adjustInventorySchema = Joi.object({
  newQuantity: Joi.number().required().min(0),
  reason: Joi.string().required().min(1).max(500)
});


// Query parameters validation
export const queryParamsSchema = Joi.object({
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1).max(100),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  search: Joi.string().optional(),
  filter: Joi.string().optional()
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
export const validateCreateItem = validate(createItemSchema);
export const validateUpdateItem = validate(updateItemSchema);
export const validateCreateCategory = validate(createCategorySchema);
export const validateUpdateCategory = validate(updateCategorySchema);
export const validateCreateSupplier = validate(createSupplierSchema);
export const validateUpdateSupplier = validate(updateSupplierSchema);
export const validateCreateMovement = validate(createMovementSchema);
export const validateAdjustInventory = validate(adjustInventorySchema);

// User validation schemas
export const createUserSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  email: Joi.string().required().email(),
  firstName: Joi.string().required().min(1).max(100),
  lastName: Joi.string().required().min(1).max(100),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'USER', 'VIEWER').optional()
});

export const updateUserSchema = Joi.object({
  username: Joi.string().optional().min(3).max(50),
  email: Joi.string().optional().email(),
  firstName: Joi.string().optional().min(1).max(100),
  lastName: Joi.string().optional().min(1).max(100),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'USER', 'VIEWER').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional()
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
export const validateLogin = validate(loginSchema);
export const validateQueryParams = validate(queryParamsSchema, 'query');
