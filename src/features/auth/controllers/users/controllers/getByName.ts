import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';

export const getByName = async (req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    res.status(StatusCodes.BAD_REQUEST).send({
      message: 'Se requiere el parámetro "name" en la consulta',
    });
    return;
  }

  const users = await userRepository.findByName(name);

  res.status(StatusCodes.OK).send({
    message: 'Usuarios obtenidos exitosamente',
    data: users.map(({ passwordHash: _, ...user }) => user),
  });
};
