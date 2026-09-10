import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

const publicUser = (user: { id: string; firstName: string; lastName: string; email: string; accountStatus: string }) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  status: user.accountStatus === 'active' ? 'verified' : user.accountStatus,
});

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: (req as AuthenticatedRequest).userId } });
  res.status(StatusCodes.OK).json(publicUser(user));
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, phone, address } = req.body as Record<string, unknown>;
  const values = Object.fromEntries(Object.entries({ firstName, lastName, phone, address }).filter(([, value]) => value !== undefined));
  const user = await prisma.user.update({ where: { id: (req as AuthenticatedRequest).userId }, data: values });
  res.status(StatusCodes.OK).json(publicUser(user));
};
