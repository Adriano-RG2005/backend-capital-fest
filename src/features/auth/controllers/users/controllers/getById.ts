import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';
import HttpException from '@/exceptions/HttpException';

export const getById = async (req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  const id = String(req.params.id);
  const user = await userRepository.findById(id);

  if (!user) {
    throw new HttpException(StatusCodes.NOT_FOUND, 'Usuario no encontrado');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  res.status(StatusCodes.OK).send({
    message: 'Usuario obtenido exitosamente',
    data: userWithoutPassword,
  });
};
