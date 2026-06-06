import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DistrictRepository } from '@/database/repositories/districtRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const remove = async (
  req: Request,
  res: Response,
  districtRepository: DistrictRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de distrito no válido');
  }

  const existingDistrict = await districtRepository.findById(id);
  if (!existingDistrict) {
    throw new NotFoundException('Distrito no encontrado');
  }

  try {
    await districtRepository.delete(id);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      throw new HttpException(
        StatusCodes.CONFLICT,
        'No se puede eliminar el distrito porque tiene registros asociados (usuarios)',
      );
    }
    throw error;
  }

  res.status(StatusCodes.OK).send({
    message: 'Distrito eliminado exitosamente',
  });
};
