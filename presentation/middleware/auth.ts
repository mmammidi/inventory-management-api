import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

// JWT authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Check if authentication is disabled in production
  const authDisabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_AUTH === 'true';
  
  if (authDisabled) {
    // Create a default user for production when auth is disabled
    req.user = {
      id: 'system',
      username: 'system',
      email: 'system@inventory-api.com',
      role: 'ADMIN'
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new CustomError('Access token required', 401);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new CustomError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError('Invalid token', 401);
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError('Token expired', 401);
    } else {
      throw new CustomError('Token verification failed', 401);
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if authentication is disabled in production
    const authDisabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_AUTH === 'true';
    
    if (authDisabled) {
      // Allow all requests when auth is disabled
      return next();
    }

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403);
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = authorize('ADMIN');

// Manager or Admin middleware
export const requireManager = authorize('ADMIN', 'MANAGER');

// Any authenticated user middleware
export const requireAuth = authorize('ADMIN', 'MANAGER', 'USER', 'VIEWER');

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};
