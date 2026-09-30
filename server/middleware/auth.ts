import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Access denied. No authentication token provided.',
    });
    return;
  }

  const secret = process.env.JWT_SECRET || 'cardforge_dev_jwt_secret_key_123';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        error: 'Invalid session. User account no longer exists.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Your session has expired. Please sign in again.',
      });
      return;
    }
    res.status(403).json({
      error: 'Invalid authentication token.',
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET || 'cardforge_dev_jwt_secret_key_123';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (_err) {
    // Ignore token errors for optional auth
  }
  next();
};
