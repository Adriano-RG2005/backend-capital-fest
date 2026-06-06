import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DistrictRepository } from '@/database/repositories/districtRepository';

export const findAll = async (
  _req: Request,
  res: Response,
  districtRepository: DistrictRepository,
): Promise<void> => {
  const districts = await districtRepository.findAll();

  res.status(StatusCodes.OK).send({
    message: 'Distritos obtenidos exitosamente',
    data: districts,
  });
};
