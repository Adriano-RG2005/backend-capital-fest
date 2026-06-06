import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ProvinceRepository } from '@/database/repositories/provinceRepository';

export const findAll = async (
  _req: Request,
  res: Response,
  provinceRepository: ProvinceRepository,
): Promise<void> => {
  const provinces = await provinceRepository.findAll();

  res.status(StatusCodes.OK).send({
    message: 'Provincias obtenidas exitosamente',
    data: provinces,
  });
};
