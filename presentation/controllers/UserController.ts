import { Request, Response } from 'express';
import { UserService } from '@/business/services/UserService';
import { CreateUserRequest, UpdateUserRequest, QueryParams } from '@/types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await this.userService.createUser(userData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createUser controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.getUserById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getUserById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string,
        filter: req.query.filter ? JSON.parse(req.query.filter as string) : {}
      };

      const result = await this.userService.getAllUsers(params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData: UpdateUserRequest = req.body;
      const result = await this.userService.updateUser(id, userData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.getActiveUsers();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getActiveUsers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.getUserStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getUserStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
