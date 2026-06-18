import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import HttpException from '@/exceptions/HttpException';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: number;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token no proporcionado o formato inválido');
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token inválido o expirado');
  }
};
