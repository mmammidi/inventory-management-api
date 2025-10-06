import { Router } from 'express';
import { ItemController } from '@/presentation/controllers/ItemController';
import { CategoryController } from '@/presentation/controllers/CategoryController';
import { SupplierController } from '@/presentation/controllers/SupplierController';
import { MovementController } from '@/presentation/controllers/MovementController';
import { UserController } from '@/presentation/controllers/UserController';
import { DashboardController } from '@/presentation/controllers/DashboardController';

// Import middleware
// Authentication middleware removed for testing purposes
import {
  validateCreateItem,
  validateUpdateItem,
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateSupplier,
  validateUpdateSupplier,
  validateCreateMovement,
  validateAdjustInventory,
  validateCreateUser,
  validateUpdateUser,
  validateQueryParams
} from '@/presentation/middleware/validation';
import { asyncHandler } from '@/presentation/middleware/errorHandler';

// Initialize controllers
const itemController = new ItemController();
const categoryController = new CategoryController();
const supplierController = new SupplierController();
const movementController = new MovementController();
const userController = new UserController();
const dashboardController = new DashboardController();

// Create router
const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inventory Management API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api-docs'
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard analytics and statistics
 *   - name: Items
 *     description: Item management operations
 *   - name: Categories
 *     description: Category management operations
 *   - name: Suppliers
 *     description: Supplier management operations
 *   - name: Movements
 *     description: Inventory movement tracking
 *   - name: Health
 *     description: API health and status
 */

// Dashboard routes
/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve comprehensive dashboard statistics including total items, categories, suppliers, and recent movements
 *     tags: [Dashboard]
 *     security: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 150
 *                         totalCategories:
 *                           type: integer
 *                           example: 12
 *                         totalSuppliers:
 *                           type: integer
 *                           example: 8
 *                         lowStockItems:
 *                           type: integer
 *                           example: 5
 *                         outOfStockItems:
 *                           type: integer
 *                           example: 2
 *                         totalInventoryValue:
 *                           type: number
 *                           example: 125000.50
 *                         recentMovements:
 *                           type: integer
 *                           example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard/stats', asyncHandler(dashboardController.getDashboardStats));

/**
 * @swagger
 * /dashboard/inventory-report:
 *   get:
 *     summary: Get inventory report
 *     description: Generate a comprehensive inventory report with item details, stock levels, and values
 *     tags: [Dashboard]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Show only low stock items
 *     responses:
 *       200:
 *         description: Inventory report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard/inventory-report', asyncHandler(dashboardController.getInventoryReport));

/**
 * @swagger
 * /dashboard/monthly-movements:
 *   get:
 *     summary: Get monthly movements
 *     description: Retrieve movement statistics for the current month
 *     tags: [Dashboard]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *     responses:
 *       200:
 *         description: Monthly movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         month:
 *                           type: integer
 *                           example: 1
 *                         year:
 *                           type: integer
 *                           example: 2024
 *                         totalMovements:
 *                           type: integer
 *                           example: 45
 *                         movementsByType:
 *                           type: object
 *                           properties:
 *                             IN:
 *                               type: integer
 *                               example: 20
 *                             OUT:
 *                               type: integer
 *                               example: 15
 *                             ADJUSTMENT:
 *                               type: integer
 *                               example: 8
 *                             TRANSFER:
 *                               type: integer
 *                               example: 2
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard/monthly-movements', asyncHandler(dashboardController.getMonthlyMovements));

// Item routes
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a paginated list of all items with optional filtering and sorting
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/schemas/PaginationQuery'
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items', validateQueryParams, asyncHandler(itemController.getAllItems));

/**
 * @swagger
 * /items/low-stock:
 *   get:
 *     summary: Get low stock items
 *     description: Retrieve items that are below their minimum quantity threshold
 *     tags: [Items]
 *     security: []
 *     responses:
 *       200:
 *         description: Low stock items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/low-stock', asyncHandler(itemController.getLowStockItems));

/**
 * @swagger
 * /items/out-of-stock:
 *   get:
 *     summary: Get out of stock items
 *     description: Retrieve items that have zero quantity
 *     tags: [Items]
 *     security: []
 *     responses:
 *       200:
 *         description: Out of stock items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/out-of-stock', asyncHandler(itemController.getOutOfStockItems));

/**
 * @swagger
 * /items/total-value:
 *   get:
 *     summary: Get total inventory value
 *     description: Calculate the total monetary value of all inventory items
 *     tags: [Items]
 *     security: []
 *     responses:
 *       200:
 *         description: Total inventory value calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalValue:
 *                           type: number
 *                           example: 125000.50
 *                         totalCost:
 *                           type: number
 *                           example: 87500.25
 *                         totalItems:
 *                           type: integer
 *                           example: 150
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/total-value', asyncHandler(itemController.getTotalInventoryValue));

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a specific item by its unique identifier
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/:id', asyncHandler(itemController.getItemById));

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create new item
 *     description: Create a new inventory item (Manager role required)
 *     tags: [Items]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *               - cost
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gaming Laptop"
 *               description:
 *                 type: string
 *                 example: "High-performance gaming laptop"
 *               sku:
 *                 type: string
 *                 example: "LAPTOP-001"
 *               barcode:
 *                 type: string
 *                 example: "1234567890123"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 1299.99
 *               cost:
 *                 type: number
 *                 format: decimal
 *                 example: 899.99
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               minQuantity:
 *                 type: integer
 *                 example: 2
 *               maxQuantity:
 *                 type: integer
 *                 example: 50
 *               unit:
 *                 type: string
 *                 example: "pcs"
 *               categoryId:
 *                 type: string
 *                 example: "clr1234567890"
 *               supplierId:
 *                 type: string
 *                 example: "clr1234567890"
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/items', validateCreateItem, asyncHandler(itemController.createItem));

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update item
 *     description: Update an existing inventory item (Manager role required)
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gaming Laptop Pro"
 *               description:
 *                 type: string
 *                 example: "Updated high-performance gaming laptop"
 *               sku:
 *                 type: string
 *                 example: "LAPTOP-001-PRO"
 *               barcode:
 *                 type: string
 *                 example: "1234567890124"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 1399.99
 *               cost:
 *                 type: number
 *                 format: decimal
 *                 example: 999.99
 *               quantity:
 *                 type: integer
 *                 example: 15
 *               minQuantity:
 *                 type: integer
 *                 example: 3
 *               maxQuantity:
 *                 type: integer
 *                 example: 60
 *               unit:
 *                 type: string
 *                 example: "pcs"
 *               categoryId:
 *                 type: string
 *                 example: "clr1234567890"
 *               supplierId:
 *                 type: string
 *                 example: "clr1234567890"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/items/:id', validateUpdateItem, asyncHandler(itemController.updateItem));

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete item
 *     description: Delete an inventory item (Manager role required)
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/items/:id', asyncHandler(itemController.deleteItem));

// Category routes
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a paginated list of all categories with optional filtering and sorting
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/schemas/PaginationQuery'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Category'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   items:
 *                                     type: integer
 *                                     example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories', validateQueryParams, asyncHandler(categoryController.getAllCategories));

/**
 * @swagger
 * /categories/list:
 *   get:
 *     summary: Get all categories (simple list)
 *     description: Retrieve a simple list of all categories without pagination, useful for dropdowns
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Categories list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Category'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   items:
 *                                     type: integer
 *                                     example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories/list', asyncHandler(categoryController.getAllCategoriesList));

/**
 * @swagger
 * /categories/stats:
 *   get:
 *     summary: Get category statistics
 *     description: Retrieve statistics showing the top categories by item count
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "Electronics"
 *                           itemCount:
 *                             type: integer
 *                             example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories/stats', asyncHandler(categoryController.getCategoryStats));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its unique identifier
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Category'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories/:id', asyncHandler(categoryController.getCategoryById));

/**
 * @swagger
 * /categories/{categoryId}/items:
 *   get:
 *     summary: Get items by category
 *     description: Retrieve all items belonging to a specific category
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - $ref: '#/components/schemas/PaginationQuery'
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories/:categoryId/items', validateQueryParams, asyncHandler(itemController.getItemsByCategory));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create new category
 *     description: Create a new inventory category (Manager role required)
 *     tags: [Categories]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 example: "Electronic devices and components"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Category'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 0
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/categories', validateCreateCategory, asyncHandler(categoryController.createCategory));

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update an existing inventory category (Manager role required)
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics & Gadgets"
 *               description:
 *                 type: string
 *                 example: "Updated electronic devices and components"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Category'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 25
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/categories/:id', validateUpdateCategory, asyncHandler(categoryController.updateCategory));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete an inventory category (Manager role required). Cannot delete categories with existing items.
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - Category has existing items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/categories/:id', asyncHandler(categoryController.deleteCategory));

// Supplier routes
/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Get all suppliers
 *     description: Retrieve a paginated list of all suppliers with optional filtering and sorting
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/schemas/PaginationQuery'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Supplier'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   items:
 *                                     type: integer
 *                                     example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suppliers', validateQueryParams, asyncHandler(supplierController.getAllSuppliers));

/**
 * @swagger
 * /suppliers/list:
 *   get:
 *     summary: Get all suppliers (simple list)
 *     description: Retrieve a simple list of all suppliers without pagination, useful for dropdowns
 *     tags: [Suppliers]
 *     security: []
 *     responses:
 *       200:
 *         description: Suppliers list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Supplier'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   items:
 *                                     type: integer
 *                                     example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suppliers/list', asyncHandler(supplierController.getAllSuppliersList));

/**
 * @swagger
 * /suppliers/active:
 *   get:
 *     summary: Get active suppliers
 *     description: Retrieve all active suppliers only
 *     tags: [Suppliers]
 *     security: []
 *     responses:
 *       200:
 *         description: Active suppliers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Supplier'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   items:
 *                                     type: integer
 *                                     example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suppliers/active', asyncHandler(supplierController.getActiveSuppliers));

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     description: Retrieve a specific supplier by its unique identifier
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Supplier'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suppliers/:id', asyncHandler(supplierController.getSupplierById));

/**
 * @swagger
 * /suppliers/{supplierId}/items:
 *   get:
 *     summary: Get items by supplier
 *     description: Retrieve all items supplied by a specific supplier
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *       - $ref: '#/components/schemas/PaginationQuery'
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suppliers/:supplierId/items', validateQueryParams, asyncHandler(itemController.getItemsBySupplier));

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create new supplier
 *     description: Create a new supplier (Manager role required)
 *     tags: [Suppliers]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp Inc."
 *               contactName:
 *                 type: string
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@techcorp.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-0123"
 *               address:
 *                 type: string
 *                 example: "123 Tech Street, Silicon Valley, CA"
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Supplier'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 0
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/suppliers', validateCreateSupplier, asyncHandler(supplierController.createSupplier));

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Update supplier
 *     description: Update an existing supplier (Manager role required)
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp Solutions Inc."
 *               contactName:
 *                 type: string
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@techcorp.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-0124"
 *               address:
 *                 type: string
 *                 example: "456 Tech Avenue, Silicon Valley, CA"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Supplier'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 items:
 *                                   type: integer
 *                                   example: 15
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/suppliers/:id', validateUpdateSupplier, asyncHandler(supplierController.updateSupplier));

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete supplier
 *     description: Delete a supplier (Manager role required). Cannot delete suppliers with existing items.
 *     tags: [Suppliers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - Supplier has existing items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Manager role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/suppliers/:id', asyncHandler(supplierController.deleteSupplier));

// Movement routes
/**
 * @swagger
 * /movements:
 *   get:
 *     summary: Get all movements
 *     description: Retrieve a paginated list of all inventory movements with optional filtering and sorting
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/schemas/PaginationQuery'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT, TRANSFER]
 *         description: Filter by movement type
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Filter by item ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements', validateQueryParams, asyncHandler(movementController.getAllMovements));

/**
 * @swagger
 * /movements/recent:
 *   get:
 *     summary: Get recent movements
 *     description: Retrieve the most recent inventory movements (last 10)
 *     tags: [Movements]
 *     security: []
 *     responses:
 *       200:
 *         description: Recent movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements/recent', asyncHandler(movementController.getRecentMovements));

/**
 * @swagger
 * /movements/stats:
 *   get:
 *     summary: Get movement statistics
 *     description: Retrieve movement statistics including counts by type and recent activity
 *     tags: [Movements]
 *     security: []
 *     responses:
 *       200:
 *         description: Movement statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalMovements:
 *                           type: integer
 *                           example: 150
 *                         movementsByType:
 *                           type: object
 *                           properties:
 *                             IN:
 *                               type: integer
 *                               example: 60
 *                             OUT:
 *                               type: integer
 *                               example: 45
 *                             ADJUSTMENT:
 *                               type: integer
 *                               example: 30
 *                             TRANSFER:
 *                               type: integer
 *                               example: 15
 *                         recentActivity:
 *                           type: integer
 *                           example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements/stats', asyncHandler(movementController.getMovementStats));

/**
 * @swagger
 * /movements/type/{type}:
 *   get:
 *     summary: Get movements by type
 *     description: Retrieve movements filtered by specific type (IN, OUT, ADJUSTMENT, TRANSFER)
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT, TRANSFER]
 *         description: Movement type
 *       - $ref: '#/components/schemas/PaginationQuery'
 *     responses:
 *       200:
 *         description: Movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *       400:
 *         description: Bad request - Invalid movement type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements/type/:type', validateQueryParams, asyncHandler(movementController.getMovementsByType));

/**
 * @swagger
 * /movements/date-range:
 *   get:
 *     summary: Get movements by date range
 *     description: Retrieve movements within a specific date range
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - $ref: '#/components/schemas/PaginationQuery'
 *     responses:
 *       200:
 *         description: Movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *       400:
 *         description: Bad request - Invalid date range
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements/date-range', validateQueryParams, asyncHandler(movementController.getMovementsByDateRange));

/**
 * @swagger
 * /movements/{id}:
 *   get:
 *     summary: Get movement by ID
 *     description: Retrieve a specific movement by its unique identifier
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movement ID
 *     responses:
 *       200:
 *         description: Movement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Movement'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Movement not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movements/:id', asyncHandler(movementController.getMovementById));

/**
 * @swagger
 * /items/{itemId}/movements:
 *   get:
 *     summary: Get movements by item
 *     description: Retrieve all movements for a specific item
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *       - $ref: '#/components/schemas/PaginationQuery'
 *     responses:
 *       200:
 *         description: Movements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movement'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/:itemId/movements', validateQueryParams, asyncHandler(movementController.getMovementsByItem));

/**
 * @swagger
 * /movements:
 *   post:
 *     summary: Create new movement
 *     description: Create a new inventory movement (User role required)
 *     tags: [Movements]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - quantity
 *               - itemId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [IN, OUT, ADJUSTMENT, TRANSFER]
 *                 example: "IN"
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               reason:
 *                 type: string
 *                 example: "Stock replenishment"
 *               reference:
 *                 type: string
 *                 example: "PO-2024-001"
 *               notes:
 *                 type: string
 *                 example: "Initial stock setup"
 *               itemId:
 *                 type: string
 *                 example: "clr1234567890"
 *     responses:
 *       201:
 *         description: Movement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Movement'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movements', validateCreateMovement, asyncHandler(movementController.createMovement));

/**
 * @swagger
 * /items/{itemId}/adjust:
 *   post:
 *     summary: Adjust inventory quantity
 *     description: Create an adjustment movement to correct inventory quantities (User role required)
 *     tags: [Movements]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - reason
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 5
 *                 description: New quantity (positive for increase, negative for decrease)
 *               reason:
 *                 type: string
 *                 example: "Physical count adjustment"
 *               notes:
 *                 type: string
 *                 example: "Found additional items during inventory count"
 *     responses:
 *       201:
 *         description: Inventory adjusted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         movement:
 *                           $ref: '#/components/schemas/Movement'
 *                         item:
 *                           $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/items/:itemId/adjust', validateAdjustInventory, asyncHandler(movementController.adjustInventory));

// User routes
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or username
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, username, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserResponse'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users', validateQueryParams, asyncHandler(userController.getAllUsers));

/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: Get active users
 *     description: Retrieve a list of all active users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Active users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/active', asyncHandler(userController.getActiveUsers));

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve user statistics including counts by role and status
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     inactiveUsers:
 *                       type: integer
 *                     adminUsers:
 *                       type: integer
 *                     managerUsers:
 *                       type: integer
 *                     regularUsers:
 *                       type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/stats', asyncHandler(userController.getUserStats));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/:id', asyncHandler(userController.getUserById));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users', validateCreateUser, asyncHandler(userController.createUser));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update an existing user's information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/users/:id', validateUpdateUser, asyncHandler(userController.updateUser));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/users/:id', asyncHandler(userController.deleteUser));

export default router;
