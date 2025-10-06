import swaggerJsdoc from 'swagger-jsdoc';
import { appConfig } from './app';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management API',
      version: appConfig.apiVersion,
      description: 'A comprehensive inventory management system API built with TypeScript, Express.js, and PostgreSQL using Prisma ORM.',
      contact: {
        name: 'API Support',
        email: 'support@inventory-api.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}`,
        description: 'Development server',
      },
      {
        url: process.env.NODE_ENV === 'production' 
          ? `${process.env.RENDER_EXTERNAL_URL || 'https://inventory-management-api.onrender.com'}${appConfig.apiPrefix}`
          : 'https://api.inventory-management.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            details: {
              type: 'string',
              example: 'Detailed error information',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER'],
              example: 'USER',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            name: {
              type: 'string',
              example: 'Electronics',
            },
            description: {
              type: 'string',
              example: 'Electronic devices and components',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            name: {
              type: 'string',
              example: 'TechCorp Inc.',
            },
            contactName: {
              type: 'string',
              example: 'John Smith',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@techcorp.com',
            },
            phone: {
              type: 'string',
              example: '+1-555-0123',
            },
            address: {
              type: 'string',
              example: '123 Tech Street, Silicon Valley, CA',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Item: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            name: {
              type: 'string',
              example: 'Gaming Laptop',
            },
            description: {
              type: 'string',
              example: 'High-performance gaming laptop',
            },
            sku: {
              type: 'string',
              example: 'LAPTOP-001',
            },
            barcode: {
              type: 'string',
              example: '1234567890123',
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 1299.99,
            },
            cost: {
              type: 'number',
              format: 'decimal',
              example: 899.99,
            },
            quantity: {
              type: 'integer',
              example: 10,
            },
            minQuantity: {
              type: 'integer',
              example: 2,
            },
            maxQuantity: {
              type: 'integer',
              example: 50,
            },
            unit: {
              type: 'string',
              example: 'pcs',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            categoryId: {
              type: 'string',
              example: 'clr1234567890',
            },
            supplierId: {
              type: 'string',
              example: 'clr1234567890',
            },
            category: {
              $ref: '#/components/schemas/Category',
            },
            supplier: {
              $ref: '#/components/schemas/Supplier',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Movement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            type: {
              type: 'string',
              enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'],
              example: 'IN',
            },
            quantity: {
              type: 'integer',
              example: 10,
            },
            reason: {
              type: 'string',
              example: 'Initial stock',
            },
            reference: {
              type: 'string',
              example: 'PO-2024-001',
            },
            notes: {
              type: 'string',
              example: 'Initial inventory setup',
            },
            itemId: {
              type: 'string',
              example: 'clr1234567890',
            },
            userId: {
              type: 'string',
              example: 'clr1234567890',
            },
            item: {
              $ref: '#/components/schemas/Item',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        PaginationQuery: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              example: 1,
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
            sortBy: {
              type: 'string',
              example: 'createdAt',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
              example: 'desc',
            },
            search: {
              type: 'string',
              example: 'search term',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {},
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
                hasNext: {
                  type: 'boolean',
                  example: true,
                },
                hasPrev: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clr1234567890',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
              example: 'USER',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              example: 'ACTIVE',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['username', 'email', 'firstName', 'lastName'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
              default: 'USER',
              example: 'USER',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'],
              example: 'USER',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              example: 'ACTIVE',
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              example: false,
            },
          },
        },
      },
    },
    security: process.env.NODE_ENV === 'production' && process.env.DISABLE_AUTH === 'true' ? [] : [
      {
        bearerAuth: []
      }
    ],
  },
  apis: [
    './routes/*.ts',
    './routes/*.js',
    './presentation/controllers/*.ts',
    './presentation/controllers/*.js',
    './server.ts',
    './server.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
