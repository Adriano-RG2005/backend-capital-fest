import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DistrictRepository } from '@/database/repositories/districtRepository';
import NotFoundException from '@/exceptions/NotFoundException';

export const findById = async (
  req: Request,
  res: Response,
  districtRepository: DistrictRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de distrito no válido');
  }

  const district = await districtRepository.findById(id);
  if (!district) {
    throw new NotFoundException('Distrito no encontrado');
  }

  res.status(StatusCodes.OK).send({
    message: 'Distrito obtenido exitosamente',
    data: district,
  });
};
