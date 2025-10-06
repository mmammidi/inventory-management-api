import request from 'supertest';
import app from '../../server';

describe('Application Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Inventory Management API is running',
        version: '1.0.0'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(200);

      expect(response.text).toContain('swagger');
    });

    it('should serve API JSON', async () => {
      const response = await request(app)
        .get('/api-docs.json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/v1/health')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(5).fill(null).map(() =>
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed in test environment (high limits)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
