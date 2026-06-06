import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';

export const deleteAll = async (_req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  await userRepository.deleteAll();

  res.status(StatusCodes.OK).send({
    message: 'Todos los usuarios han sido eliminados correctamente',
  });
};
