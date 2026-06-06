import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ProvinceRepository } from '@/database/repositories/provinceRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const remove = async (
  req: Request,
  res: Response,
  provinceRepository: ProvinceRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de provincia no válido');
  }

  const existingProvince = await provinceRepository.findById(id);
  if (!existingProvince) {
    throw new NotFoundException('Provincia no encontrada');
  }

  try {
    await provinceRepository.delete(id);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      throw new HttpException(
        StatusCodes.CONFLICT,
        'No se puede eliminar la provincia porque tiene registros asociados (distritos o usuarios)',
      );
    }
    throw error;
  }

  res.status(StatusCodes.OK).send({
    message: 'Provincia eliminada exitosamente',
  });
};
