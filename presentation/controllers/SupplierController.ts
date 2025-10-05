import { Request, Response } from 'express';
import { SupplierService } from '@/business/services/SupplierService';
import { CreateSupplierRequest, UpdateSupplierRequest, QueryParams } from '@/types';

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const supplierData: CreateSupplierRequest = req.body;
      const result = await this.supplierService.createSupplier(supplierData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createSupplier controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.supplierService.getSupplierById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getSupplierById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const params: QueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string,
        filter: req.query.filter ? JSON.parse(req.query.filter as string) : {}
      };

      const result = await this.supplierService.getAllSuppliers(params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getAllSuppliers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateSupplierRequest = req.body;
      const result = await this.supplierService.updateSupplier(id, updateData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in updateSupplier controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.supplierService.deleteSupplier(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in deleteSupplier controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getAllSuppliersList = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.supplierService.getAllSuppliersList();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getAllSuppliersList controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getActiveSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.supplierService.getActiveSuppliers();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getActiveSuppliers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
