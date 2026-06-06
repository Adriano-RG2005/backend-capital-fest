import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';

export const getAll = async (_req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  const users = await userRepository.findAll();
  res.status(StatusCodes.OK).send({
    message: 'Usuarios obtenidos exitosamente',
    data: users.map(({ passwordHash: _, ...user }) => user),
  });
};
