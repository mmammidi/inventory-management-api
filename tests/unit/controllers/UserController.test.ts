import { Request, Response } from 'express';
import { UserController } from '../../../presentation/controllers/UserController';
import { UserService } from '../../../business/services/UserService';
import { mockRequest, mockResponse, createMockUser } from '../../utils/testHelpers';

// Mock the UserService
jest.mock('../../../business/services/UserService');
const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockUserService = new MockedUserService() as jest.Mocked<UserService>;
    userController = new UserController();
    (userController as any).userService = mockUserService;
    
    mockReq = mockRequest();
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      };

      const mockUser = createMockUser(userData);
      const mockResponse = {
        success: true,
        data: mockUser,
        message: 'User created successfully'
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);
      mockReq.body = userData;

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const userData = { username: 'ab' }; // Invalid data - too short
      const mockResponse = {
        success: false,
        error: 'Validation failed',
        details: [{ field: 'username', message: 'Username must be at least 3 characters' }]
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);
      mockReq.body = userData;

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate email', async () => {
      const userData = { 
        username: 'testuser',
        email: 'existing@example.com',
        firstName: 'Test',
        lastName: 'User'
      };
      const mockResponse = {
        success: false,
        error: 'User with this email already exists'
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);
      mockReq.body = userData;

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate username', async () => {
      const userData = { 
        username: 'existinguser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };
      const mockResponse = {
        success: false,
        error: 'User with this username already exists'
      };

      mockUserService.createUser.mockResolvedValue(mockResponse);
      mockReq.body = userData;

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      const userData = { 
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };
      mockUserService.createUser.mockRejectedValue(new Error('Database error'));

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with default parameters', async () => {
      const mockUsers = [createMockUser(), createMockUser()];
      const mockResponse = {
        success: true,
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };

      mockUserService.getAllUsers.mockResolvedValue(mockResponse);
      mockReq.query = {};

      await userController.getAllUsers(mockReq as Request, mockRes as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: undefined,
        search: undefined,
        filter: {}
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should get users with query parameters', async () => {
      const mockResponse = { success: true, data: { users: [], pagination: {} } };
      mockUserService.getAllUsers.mockResolvedValue(mockResponse);
      mockReq.query = {
        page: '2',
        limit: '5',
        sortBy: 'firstName',
        sortOrder: 'asc',
        search: 'test',
        filter: JSON.stringify({ role: 'USER' })
      };

      await userController.getAllUsers(mockReq as Request, mockRes as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'firstName',
        sortOrder: 'asc',
        search: 'test',
        filter: { role: 'USER' }
      });
    });

    it('should handle service errors', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        success: true,
        data: mockUser
      };

      mockUserService.getUserById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };

      await userController.getUserById(mockReq as Request, mockRes as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle user not found', async () => {
      const mockResponse = {
        success: false,
        error: 'User not found'
      };

      mockUserService.getUserById.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await userController.getUserById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'user-id' };

      await userController.getUserById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { firstName: 'Updated Name' };
      const mockUser = createMockUser(updateData);
      const mockResponse = {
        success: true,
        data: mockUser,
        message: 'User updated successfully'
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };
      mockReq.body = updateData;

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-id', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle user not found', async () => {
      const mockResponse = {
        success: false,
        error: 'User not found'
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { firstName: 'Updated' };

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Validation failed'
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };
      mockReq.body = { email: 'invalid-email' };

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate email on update', async () => {
      const mockResponse = {
        success: false,
        error: 'User with this email already exists'
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };
      mockReq.body = { email: 'existing@example.com' };

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle duplicate username on update', async () => {
      const mockResponse = {
        success: false,
        error: 'User with this username already exists'
      };

      mockUserService.updateUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };
      mockReq.body = { username: 'existinguser' };

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      mockUserService.deleteUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'user-id' };

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle user not found', async () => {
      const mockResponse = {
        success: false,
        error: 'User not found'
      };

      mockUserService.deleteUser.mockResolvedValue(mockResponse);
      mockReq.params = { id: 'non-existent-id' };

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Database error'));
      mockReq.params = { id: 'user-id' };

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getActiveUsers', () => {
    it('should get active users successfully', async () => {
      const mockUsers = [createMockUser({ isActive: true })];
      const mockResponse = {
        success: true,
        data: mockUsers
      };

      mockUserService.getActiveUsers.mockResolvedValue(mockResponse);

      await userController.getActiveUsers(mockReq as Request, mockRes as Response);

      expect(mockUserService.getActiveUsers).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockUserService.getActiveUsers.mockRejectedValue(new Error('Database error'));

      await userController.getActiveUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics successfully', async () => {
      const mockStats = {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
        adminUsers: 1,
        managerUsers: 2,
        regularUsers: 7
      };
      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockUserService.getUserStats.mockResolvedValue(mockResponse);

      await userController.getUserStats(mockReq as Request, mockRes as Response);

      expect(mockUserService.getUserStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle service errors', async () => {
      mockUserService.getUserStats.mockRejectedValue(new Error('Database error'));

      await userController.getUserStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
