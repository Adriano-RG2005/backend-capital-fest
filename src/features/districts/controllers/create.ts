import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DistrictRepository } from '@/database/repositories/districtRepository';
import HttpException from '@/exceptions/HttpException';

export const create = async (
  req: Request,
  res: Response,
  districtRepository: DistrictRepository,
): Promise<void> => {
  const { id, name, provinceId } = req.body;

  const existingDistrict = await districtRepository.findById(Number(id));
  if (existingDistrict) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'El distrito ya está registrado');
  }

  const existingByName = await districtRepository.findByName(name);
  if (existingByName) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe un distrito con ese nombre');
  }

  const district = await districtRepository.create({
    id: Number(id),
    name,
    provinceId: Number(provinceId),
  });

  res.status(StatusCodes.CREATED).send({
    message: 'Distrito creado exitosamente',
    data: district,
  });
};
