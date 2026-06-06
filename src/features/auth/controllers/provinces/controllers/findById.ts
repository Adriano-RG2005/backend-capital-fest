import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ProvinceRepository } from '@/database/repositories/provinceRepository';
import NotFoundException from '@/exceptions/NotFoundException';

export const findById = async (
  req: Request,
  res: Response,
  provinceRepository: ProvinceRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de provincia no válido');
  }

  const province = await provinceRepository.findById(id);
  if (!province) {
    throw new NotFoundException('Provincia no encontrada');
  }

  res.status(StatusCodes.OK).send({
    message: 'Provincia obtenida exitosamente',
    data: province,
  });
};
