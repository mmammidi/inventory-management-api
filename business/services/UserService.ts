import Database from '@/data/models/Database';
import { 
  CreateUserRequest, 
  UpdateUserRequest,
  UserResponse, 
  QueryParams,
  ApiResponse,
  PaginationInfo
} from '@/types';
import { User } from '@prisma/client';

export class UserService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
    try {
      // Check if user already exists
      const existingUserByEmail = await this.db.users.findByEmail(data.email);
      if (existingUserByEmail) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      const existingUserByUsername = await this.db.users.findByUsername(data.username);
      if (existingUserByUsername) {
        return {
          success: false,
          error: 'User with this username already exists'
        };
      }

      // Create user
      const user = await this.db.users.create(data);

      return {
        success: true,
        data: this.mapUserToResponse(user),
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  async getUserById(id: string): Promise<ApiResponse<UserResponse>> {
    try {
      const user = await this.db.users.findById(id);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.mapUserToResponse(user)
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: 'Failed to fetch user'
      };
    }
  }

  async getAllUsers(params?: QueryParams): Promise<ApiResponse<{ users: UserResponse[]; pagination: PaginationInfo }>> {
    try {
      const result = await this.db.users.findAll(params);
      
      return {
        success: true,
        data: {
          users: result.data.map(user => this.mapUserToResponse(user)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
    try {
      const existingUser = await this.db.users.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Check if email is being changed and if it already exists
      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.db.users.findByEmail(data.email);
        if (userWithEmail) {
          return {
            success: false,
            error: 'User with this email already exists'
          };
        }
      }

      // Check if username is being changed and if it already exists
      if (data.username && data.username !== existingUser.username) {
        const userWithUsername = await this.db.users.findByUsername(data.username);
        if (userWithUsername) {
          return {
            success: false,
            error: 'User with this username already exists'
          };
        }
      }

      const updatedUser = await this.db.users.update(id, data);

      return {
        success: true,
        data: this.mapUserToResponse(updatedUser),
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const existingUser = await this.db.users.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      await this.db.users.delete(id);

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  async getActiveUsers(): Promise<ApiResponse<UserResponse[]>> {
    try {
      const users = await this.db.users.getActiveUsers();
      
      return {
        success: true,
        data: users.map(user => this.mapUserToResponse(user))
      };
    } catch (error) {
      console.error('Error fetching active users:', error);
      return {
        success: false,
        error: 'Failed to fetch active users'
      };
    }
  }

  async getUserStats(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    managerUsers: number;
    regularUsers: number;
  }>> {
    try {
      const stats = await this.db.users.getUserStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        error: 'Failed to fetch user stats'
      };
    }
  }

  private mapUserToResponse(user: any): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
