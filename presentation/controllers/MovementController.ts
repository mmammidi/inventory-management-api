import { Request, Response } from 'express';
import { MovementService } from '@/business/services/MovementService';
import { CreateMovementRequest, QueryParams } from '@/types';

export class MovementController {
  private movementService: MovementService;

  constructor() {
    this.movementService = new MovementService();
  }

  createMovement = async (req: Request, res: Response): Promise<void> => {
    try {
      const movementData: CreateMovementRequest = req.body;
      const userId = (req as any).user?.id; // Assuming user is attached by auth middleware
      const result = await this.movementService.createMovement(movementData, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createMovement controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMovementById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.movementService.getMovementById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getMovementById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getAllMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string,
        filter: req.query.filter ? JSON.parse(req.query.filter as string) : {}
      };

      const result = await this.movementService.getAllMovements(params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getAllMovements controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMovementsByItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itemId } = req.params;
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.movementService.getMovementsByItem(itemId, params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getMovementsByItem controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getRecentMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.movementService.getRecentMovements(limit);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getRecentMovements controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMovementsByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.movementService.getMovementsByType(type, params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getMovementsByType controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMovementStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itemId } = req.query;
      const result = await this.movementService.getMovementStats(itemId as string);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getMovementStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMovementsByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.movementService.getMovementsByDateRange(start, end, params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getMovementsByDateRange controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  adjustInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itemId } = req.params;
      const { newQuantity, reason } = req.body;
      const userId = (req as any).user?.id;

      if (typeof newQuantity !== 'number' || newQuantity < 0) {
        res.status(400).json({
          success: false,
          error: 'Valid new quantity is required'
        });
        return;
      }

      const result = await this.movementService.adjustInventory(itemId, newQuantity, reason, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in adjustInventory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
