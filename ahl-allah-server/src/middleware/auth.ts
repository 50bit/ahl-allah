import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      status: 401,
      message: 'You are not authorized',
      data: {}
    });
    return;
  }

  try {
    const decoded = verifyToken(token) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId
    };
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: 'You are not authorized',
      data: {}
    });
    return;
  }
};

export const requireRole = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 401,
        message: 'You are not authorized',
        data: {}
      });
      return;
    }

    if (!roles.includes(req.user.roleId)) {
      res.status(403).json({
        status: 403,
        message: 'Access denied. Insufficient permissions.',
        data: {}
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole([1]); // Admin role
export const requireMohafez = requireRole([2]); // Mohafez role
export const requireNormalUser = requireRole([3]); // Normal user role
