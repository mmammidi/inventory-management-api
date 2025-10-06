import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { appConfig } from '@/config/app';
import { Database } from '@/data/models/Database';

export class AuthController {
  /**
   * User login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const db = Database.getInstance();
      const user = await db.users.findByEmail(email);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Account is deactivated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        {
          userId: user.id,
          type: 'refresh',
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtRefreshExpiresIn }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
          expiresIn: appConfig.jwtExpiresIn,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * User registration
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      if (!email || !username || !password) {
        res.status(400).json({
          success: false,
          error: 'Email, username, and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const db = Database.getInstance();

      // Check if user already exists
      const existingUserByEmail = await db.users.findByEmail(email);
      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const existingUserByUsername = await db.users.findByUsername(username);
      if (existingUserByUsername) {
        res.status(409).json({
          success: false,
          error: 'User with this username already exists',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, appConfig.bcryptRounds);

      // Create user
      const newUser = await db.users.create({
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'USER', // Default role
        isActive: true,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        {
          userId: newUser.id,
          type: 'refresh',
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtRefreshExpiresIn }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
          expiresIn: appConfig.jwtExpiresIn,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Refresh token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, appConfig.jwtSecret) as any;

      if (decoded.type !== 'refresh') {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const db = Database.getInstance();
      const user = await db.users.findById(decoded.userId);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new access token
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          expiresIn: appConfig.jwtExpiresIn,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const db = Database.getInstance();
      const user = await db.users.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: userWithoutPassword,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Logout (client-side token removal)
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
      timestamp: new Date().toISOString(),
    });
  };
}





