import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ProvinceRepository } from '@/database/repositories/provinceRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const update = async (
  req: Request,
  res: Response,
  provinceRepository: ProvinceRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de provincia no válido');
  }

  const { name, departmentId } = req.body;

  const existingProvince = await provinceRepository.findById(id);
  if (!existingProvince) {
    throw new NotFoundException('Provincia no encontrada');
  }

  const duplicateName = await provinceRepository.findByName(name);
  if (duplicateName && duplicateName.id !== id) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe otra provincia con ese nombre');
  }

  const updatedProvince = await provinceRepository.update(id, {
    name,
    departmentId: Number(departmentId),
  });

  res.status(StatusCodes.OK).send({
    message: 'Provincia actualizada exitosamente',
    data: updatedProvince,
  });
};
