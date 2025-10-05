import { Request, Response } from 'express';
import { DashboardService } from '@/business/services/DashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.dashboardService.getDashboardStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getDashboardStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getInventoryReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.dashboardService.getInventoryReport();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getInventoryReport controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getMonthlyMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.dashboardService.getMonthlyMovements();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getMonthlyMovements controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
