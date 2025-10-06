import request from 'supertest';
import app from '../../server';
import { TestDatabase } from '../utils/testHelpers';
import { testCategories, invalidTestData } from '../fixtures/testData';

describe('Categories API Endpoints', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = new TestDatabase();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  describe('POST /api/v1/categories', () => {
    it('should create a new category with valid data', async () => {
      const categoryData = testCategories[0];

      const response = await request(app)
        .post('/api/v1/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Category created successfully'
      });
      expect(response.body.data).toMatchObject({
        name: categoryData.name,
        description: categoryData.description,
        isActive: categoryData.isActive
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for invalid category data', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .send(invalidTestData.category)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for duplicate category name', async () => {
      const categoryData = testCategories[0];

      // Create first category
      await request(app)
        .post('/api/v1/categories')
        .send(categoryData)
        .expect(201);

      // Try to create second category with same name
      const response = await request(app)
        .post('/api/v1/categories')
        .send(categoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category with this name already exists');
    });

    it('should create category with minimal required data', async () => {
      const categoryData = {
        name: 'Minimal Category'
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: categoryData.name,
        description: null,
        isActive: true // default value
      });
    });
  });

  describe('GET /api/v1/categories', () => {
    beforeEach(async () => {
      // Create test categories
      for (let i = 0; i < 3; i++) {
        await testDb.createTestCategory({
          name: `Test Category ${i + 1}`,
          description: `Description for category ${i + 1}`
        });
      }
    });

    it('should return all categories with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data.categories).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/categories?page=1&limit=2')
        .expect(200);

      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2
      });
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/categories?search=Test Category 1')
        .expect(200);

      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].name).toBe('Test Category 1');
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/categories?sortBy=name&sortOrder=asc')
        .expect(200);

      const categories = response.body.data.categories;
      expect(categories[0].name).toBe('Test Category 1');
      expect(categories[1].name).toBe('Test Category 2');
    });

    it('should support filtering by active status', async () => {
      // Create an inactive category
      await testDb.createTestCategory({
        name: 'Inactive Category',
        isActive: false
      });

      const response = await request(app)
        .get('/api/v1/categories?filter[isActive]=true')
        .expect(200);

      response.body.data.categories.forEach((category: any) => {
        expect(category.isActive).toBe(true);
      });
    });

    it('should include item counts when requested', async () => {
      const category = await testDb.createTestCategory();
      const supplier = await testDb.createTestSupplier();

      // Create items in this category
      await testDb.createTestItem({
        categoryId: category.id,
        supplierId: supplier.id
      });

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      const categoryWithItems = response.body.data.categories.find(
        (cat: any) => cat.id === category.id
      );
      expect(categoryWithItems.itemCount).toBeDefined();
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await testDb.createTestCategory();
    });

    it('should return category by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/categories/${testCategory.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testCategory.id,
          name: testCategory.name,
          description: testCategory.description,
          isActive: testCategory.isActive
        }
      });
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/v1/categories/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Category not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/categories/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid category ID');
    });

    it('should include item count when requested', async () => {
      const supplier = await testDb.createTestSupplier();

      // Create items in this category
      await testDb.createTestItem({
        categoryId: testCategory.id,
        supplierId: supplier.id
      });

      const response = await request(app)
        .get(`/api/v1/categories/${testCategory.id}`)
        .expect(200);

      expect(response.body.data.itemCount).toBeDefined();
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await testDb.createTestCategory();
    });

    it('should update category with valid data', async () => {
      const updateData = {
        name: 'Updated Category Name',
        description: 'Updated description',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/v1/categories/${testCategory.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Category updated successfully'
      });
      expect(response.body.data).toMatchObject({
        id: testCategory.id,
        name: updateData.name,
        description: updateData.description,
        isActive: updateData.isActive
      });
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .put('/api/v1/categories/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Category not found');
    });

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/api/v1/categories/${testCategory.id}`)
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should prevent duplicate names on update', async () => {
      const anotherCategory = await testDb.createTestCategory({
        name: 'Another Category'
      });

      const response = await request(app)
        .put(`/api/v1/categories/${testCategory.id}`)
        .send({ name: anotherCategory.name })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category with this name already exists');
    });

    it('should allow updating with same name', async () => {
      const updateData = {
        name: testCategory.name,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/categories/${testCategory.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await testDb.createTestCategory();
    });

    it('should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${testCategory.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Category deleted successfully'
      });
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Category not found');
    });

    it('should prevent deletion of category with items', async () => {
      const supplier = await testDb.createTestSupplier();

      // Create an item in this category
      await testDb.createTestItem({
        categoryId: testCategory.id,
        supplierId: supplier.id
      });

      const response = await request(app)
        .delete(`/api/v1/categories/${testCategory.id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot delete category with existing items');
    });
  });

  describe('GET /api/v1/categories/stats', () => {
    beforeEach(async () => {
      // Create categories with different statuses
      await testDb.createTestCategory({ name: 'Active Category 1', isActive: true });
      await testDb.createTestCategory({ name: 'Active Category 2', isActive: true });
      await testDb.createTestCategory({ name: 'Inactive Category', isActive: false });

      // Create items in some categories
      const category1 = await testDb.createTestCategory({ name: 'Category with Items' });
      const supplier = await testDb.createTestSupplier();

      await testDb.createTestItem({
        categoryId: category1.id,
        supplierId: supplier.id
      });
    });

    it('should return category statistics', async () => {
      const response = await request(app)
        .get('/api/v1/categories/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          totalCategories: expect.any(Number),
          activeCategories: expect.any(Number),
          inactiveCategories: expect.any(Number),
          categoriesWithItems: expect.any(Number)
        }
      });

      expect(response.body.data.totalCategories).toBeGreaterThan(0);
      expect(response.body.data.activeCategories).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/categories/active', () => {
    beforeEach(async () => {
      // Create active and inactive categories
      await testDb.createTestCategory({ name: 'Active Category 1', isActive: true });
      await testDb.createTestCategory({ name: 'Active Category 2', isActive: true });
      await testDb.createTestCategory({ name: 'Inactive Category', isActive: false });
    });

    it('should return only active categories', async () => {
      const response = await request(app)
        .get('/api/v1/categories/active')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true
      });
      expect(response.body.data.categories).toBeInstanceOf(Array);
      
      response.body.data.categories.forEach((category: any) => {
        expect(category.isActive).toBe(true);
      });
    });
  });
});
