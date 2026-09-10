import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '@/exceptions/HttpException';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token requerido');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key') as jwt.JwtPayload;
    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
      throw new Error('Invalid token payload');
    }
    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.userId = payload.userId;
    authenticatedRequest.userEmail = payload.email;
    next();
  } catch {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token inválido o expirado');
  }
};
