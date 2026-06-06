import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ProvinceRepository } from '@/database/repositories/provinceRepository';
import HttpException from '@/exceptions/HttpException';

export const create = async (
  req: Request,
  res: Response,
  provinceRepository: ProvinceRepository,
): Promise<void> => {
  const { id, name, departmentId } = req.body;

  const existingProvince = await provinceRepository.findById(Number(id));
  if (existingProvince) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'La provincia ya está registrada');
  }

  const existingByName = await provinceRepository.findByName(name);
  if (existingByName) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe una provincia con ese nombre');
  }

  const province = await provinceRepository.create({
    id: Number(id),
    name,
    departmentId: Number(departmentId),
  });

  res.status(StatusCodes.CREATED).send({
    message: 'Provincia creada exitosamente',
    data: province,
  });
};
