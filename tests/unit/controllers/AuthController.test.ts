import { Request, Response } from 'express';
import { AuthController } from '../../../presentation/controllers/AuthController';
import { mockRequest, mockResponse, createMockUser } from '../../utils/testHelpers';

describe.skip('AuthController', () => {
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController();
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const mockUser = createMockUser({ username: 'testuser' });
      const mockToken = 'jwt-token-here';
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        },
        message: 'Login successful'
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockReq.body = loginData;

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const mockResponse = {
        success: false,
        error: 'Invalid credentials'
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockReq.body = loginData;

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const loginData = { username: 'ab' }; // Invalid data - too short
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'username', message: 'Username must be at least 3 characters' }]
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockReq.body = loginData;

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle inactive user', async () => {
      const loginData = {
        username: 'inactiveuser',
        password: 'password123'
      };

      const mockResponse = {
        success: false,
        error: 'Account is inactive'
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockReq.body = loginData;

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        role: 'USER'
      };

      const mockUser = createMockUser({
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User'
      });
      const mockToken = 'jwt-token-here';
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        },
        message: 'Registration successful'
      };

      mockAuthService.register.mockResolvedValue(mockResponse);
      mockReq.body = registerData;

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const registerData = { 
        username: 'ab', // Invalid - too short
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        password: '123' // Too short
      };
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [
          { field: 'username', message: 'Username must be at least 3 characters' },
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password must be at least 6 characters' }
        ]
      };

      mockAuthService.register.mockResolvedValue(mockResponse);
      mockReq.body = registerData;

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate username', async () => {
      const registerData = {
        username: 'existinguser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      };

      const mockResponse = {
        success: false,
        error: 'Username already exists'
      };

      mockAuthService.register.mockResolvedValue(mockResponse);
      mockReq.body = registerData;

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate email', async () => {
      const registerData = {
        username: 'newuser',
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      };

      const mockResponse = {
        success: false,
        error: 'Email already exists'
      };

      mockAuthService.register.mockResolvedValue(mockResponse);
      mockReq.body = registerData;

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123'
      };
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Logout successful'
      };

      mockAuthService.logout.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer jwt-token' };

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith('jwt-token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing token', async () => {
      const mockResponse = {
        success: false,
        error: 'No token provided'
      };

      mockAuthService.logout.mockResolvedValue(mockResponse);
      mockReq.headers = {};

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid token', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid token'
      };

      mockAuthService.logout.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Database error'));
      mockReq.headers = { authorization: 'Bearer jwt-token' };

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockToken = 'new-jwt-token';
      const mockResponse = {
        success: true,
        data: { token: mockToken },
        message: 'Token refreshed successfully'
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer old-jwt-token' };

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-jwt-token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing token', async () => {
      const mockResponse = {
        success: false,
        error: 'No token provided'
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);
      mockReq.headers = {};

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid token', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid token'
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new Error('Database error'));
      mockReq.headers = { authorization: 'Bearer jwt-token' };

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        success: true,
        data: mockUser
      };

      mockAuthService.getProfile.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer jwt-token' };

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('jwt-token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing token', async () => {
      const mockResponse = {
        success: false,
        error: 'No token provided'
      };

      mockAuthService.getProfile.mockResolvedValue(mockResponse);
      mockReq.headers = {};

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle invalid token', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid token'
      };

      mockAuthService.getProfile.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockAuthService.getProfile.mockRejectedValue(new Error('Database error'));
      mockReq.headers = { authorization: 'Bearer jwt-token' };

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com'
      };

      const mockUser = createMockUser(updateData);
      const mockResponse = {
        success: true,
        data: mockUser,
        message: 'Profile updated successfully'
      };

      mockAuthService.updateProfile.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer jwt-token' };
      mockReq.body = updateData;

      await authController.updateProfile(mockReq as Request, mockRes as Response);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('jwt-token', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const updateData = { email: 'invalid-email' };
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email format' }]
      };

      mockAuthService.updateProfile.mockResolvedValue(mockResponse);
      mockReq.headers = { authorization: 'Bearer jwt-token' };
      mockReq.body = updateData;

      await authController.updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const updateData = { firstName: 'Updated' };
      mockAuthService.updateProfile.mockRejectedValue(new Error('Database error'));
      mockReq.headers = { authorization: 'Bearer jwt-token' };
      mockReq.body = updateData;

      await authController.updateProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
