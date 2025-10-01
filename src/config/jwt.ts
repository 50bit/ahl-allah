import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'ByYM000OLlMQG6VVVp1OH7Xzyr7gHuw1qvUC5dcGt3SNM';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const JWT_ISSUER = process.env.JWT_ISSUER || 'http://localhost:60772';
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'http://localhost:4200';
export const REFRESH_TOKEN_EXPIRES_IN_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '30');

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  }) as JwtPayload;
};

export const generateRefreshToken = (): string => {
  // Use crypto random string as opaque refresh token
  return crypto.randomBytes(48).toString('hex');
};
