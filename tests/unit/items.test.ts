import request from 'supertest';
import app from '../../server';
import { app } from '../../server';
import { TestDatabase, mockRequest, mockResponse } from '../utils/testHelpers';
import { testItems, invalidTestData } from '../fixtures/testData';

describe('Items API Endpoints', () => {
  let testDb: TestDatabase;
  let testCategory: any;
  let testSupplier: any;
  let testUser: any;

  beforeAll(async () => {
    testDb = new TestDatabase();
    testCategory = await testDb.createTestCategory();
    testSupplier = await testDb.createTestSupplier();
    testUser = await testDb.createTestUser();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  describe('POST /api/v1/items', () => {
    it('should create a new item with valid data', async () => {
      const itemData = {
        ...testItems[0],
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item created successfully'
      });
      expect(response.body.data).toMatchObject({
        name: itemData.name,
        sku: itemData.sku,
        price: itemData.price,
        quantity: itemData.quantity
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for invalid item data', async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .send(invalidTestData.item)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for duplicate SKU', async () => {
      const itemData = {
        ...testItems[0],
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      };

      // Create first item
      await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(201);

      // Try to create second item with same SKU
      const response = await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('SKU already exists');
    });

    it('should return 400 for non-existent category', async () => {
      const itemData = {
        ...testItems[0],
        categoryId: 'non-existent-category-id',
        supplierId: testSupplier.id
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category not found');
    });

    it('should return 400 for non-existent supplier', async () => {
      const itemData = {
        ...testItems[0],
        categoryId: testCategory.id,
        supplierId: 'non-existent-supplier-id'
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Supplier not found');
    });
  });

  describe('GET /api/v1/items', () => {
    beforeEach(async () => {
      // Create test items
      for (let i = 0; i < 3; i++) {
        await testDb.createTestItem({
          name: `Test Item ${i + 1}`,
          sku: `TEST-${i + 1}`,
          categoryId: testCategory.id,
          supplierId: testSupplier.id
        });
      }
    });

    it('should return all items with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/items?page=1&limit=2')
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2
      });
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/items?search=Test Item 1')
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Test Item 1');
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/items?sortBy=name&sortOrder=asc')
        .expect(200);

      const items = response.body.data.items;
      expect(items[0].name).toBe('Test Item 1');
      expect(items[1].name).toBe('Test Item 2');
    });

    it('should support filtering by category', async () => {
      const response = await request(app)
        .get(`/api/v1/items?filter[categoryId]=${testCategory.id}`)
        .expect(200);

      response.body.data.items.forEach((item: any) => {
        expect(item.category.id).toBe(testCategory.id);
      });
    });

    it('should support filtering by supplier', async () => {
      const response = await request(app)
        .get(`/api/v1/items?filter[supplierId]=${testSupplier.id}`)
        .expect(200);

      response.body.data.items.forEach((item: any) => {
        expect(item.supplier.id).toBe(testSupplier.id);
      });
    });
  });

  describe('GET /api/v1/items/:id', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await testDb.createTestItem({
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should return item by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/items/${testItem.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testItem.id,
          name: testItem.name,
          sku: testItem.sku
        }
      });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/v1/items/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/items/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid item ID');
    });
  });

  describe('PUT /api/v1/items/:id', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await testDb.createTestItem({
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should update item with valid data', async () => {
      const updateData = {
        name: 'Updated Item Name',
        description: 'Updated description',
        price: 99.99
      };

      const response = await request(app)
        .put(`/api/v1/items/${testItem.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item updated successfully'
      });
      expect(response.body.data).toMatchObject({
        id: testItem.id,
        name: updateData.name,
        description: updateData.description,
        price: updateData.price
      });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/v1/items/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/v1/items/${testItem.id}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/v1/items/:id', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await testDb.createTestItem({
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should delete item successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/items/${testItem.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item deleted successfully'
      });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/v1/items/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('POST /api/v1/items/:id/adjust', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await testDb.createTestItem({
        quantity: 100,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should adjust item quantity', async () => {
      const adjustData = {
        quantity: 50,
        reason: 'Stock adjustment',
        notes: 'Manual adjustment'
      };

      const response = await request(app)
        .post(`/api/v1/items/${testItem.id}/adjust`)
        .send(adjustData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item quantity adjusted successfully'
      });
      expect(response.body.data.quantity).toBe(150); // 100 + 50
    });

    it('should handle negative quantity adjustments', async () => {
      const adjustData = {
        quantity: -20,
        reason: 'Damaged goods',
        notes: 'Items damaged'
      };

      const response = await request(app)
        .post(`/api/v1/items/${testItem.id}/adjust`)
        .send(adjustData)
        .expect(200);

      expect(response.body.data.quantity).toBe(80); // 100 - 20
    });

    it('should return 400 for invalid adjustment data', async () => {
      const response = await request(app)
        .post(`/api/v1/items/${testItem.id}/adjust`)
        .send({ quantity: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .post('/api/v1/items/non-existent-id/adjust')
        .send({ quantity: 10 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('GET /api/v1/items/low-stock', () => {
    beforeEach(async () => {
      // Create items with low stock
      await testDb.createTestItem({
        name: 'Low Stock Item 1',
        quantity: 5,
        minQuantity: 10,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });

      await testDb.createTestItem({
        name: 'Low Stock Item 2',
        quantity: 2,
        minQuantity: 5,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });

      // Create item with normal stock
      await testDb.createTestItem({
        name: 'Normal Stock Item',
        quantity: 50,
        minQuantity: 10,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should return items with low stock', async () => {
      const response = await request(app)
        .get('/api/v1/items/low-stock')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data.items).toHaveLength(2);
      response.body.data.items.forEach((item: any) => {
        expect(item.quantity).toBeLessThanOrEqual(item.minQuantity);
      });
    });
  });

  describe('GET /api/v1/items/out-of-stock', () => {
    beforeEach(async () => {
      // Create out of stock items
      await testDb.createTestItem({
        name: 'Out of Stock Item 1',
        quantity: 0,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });

      await testDb.createTestItem({
        name: 'Out of Stock Item 2',
        quantity: 0,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });

      // Create item with stock
      await testDb.createTestItem({
        name: 'In Stock Item',
        quantity: 10,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should return out of stock items', async () => {
      const response = await request(app)
        .get('/api/v1/items/out-of-stock')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data.items).toHaveLength(2);
      response.body.data.items.forEach((item: any) => {
        expect(item.quantity).toBe(0);
      });
    });
  });

  describe('GET /api/v1/items/stats', () => {
    beforeEach(async () => {
      // Create items with different quantities
      await testDb.createTestItem({
        name: 'Item 1',
        quantity: 10,
        price: 100,
        cost: 50,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });

      await testDb.createTestItem({
        name: 'Item 2',
        quantity: 20,
        price: 200,
        cost: 100,
        categoryId: testCategory.id,
        supplierId: testSupplier.id
      });
    });

    it('should return item statistics', async () => {
      const response = await request(app)
        .get('/api/v1/items/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          totalItems: expect.any(Number),
          totalValue: expect.any(Number),
          totalCost: expect.any(Number),
          lowStockItems: expect.any(Number),
          outOfStockItems: expect.any(Number)
        }
      });
    });
  });
});
