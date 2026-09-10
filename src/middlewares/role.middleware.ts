import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { prisma } from '@/database/db';

export const requireAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user || user.role.name.toLowerCase() !== 'admin') {
    throw new HttpException(StatusCodes.FORBIDDEN, 'Se requiere un usuario administrador');
  }
  next();
};
