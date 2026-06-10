import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DistrictRepository } from '@/database/repositories/districtRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const update = async (
  req: Request,
  res: Response,
  districtRepository: DistrictRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de distrito no válido');
  }

  const { name, provinceId } = req.body;

  const existingDistrict = await districtRepository.findById(id);
  if (!existingDistrict) {
    throw new NotFoundException('Distrito no encontrado');
  }

  const duplicateName = await districtRepository.findByName(name);
  if (duplicateName && duplicateName.id !== id) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe otro distrito con ese nombre');
  }

  const updatedDistrict = await districtRepository.update(id, {
    name,
    provinceId: Number(provinceId),
  });

  res.status(StatusCodes.OK).send({
    message: 'Distrito actualizado exitosamente',
    data: updatedDistrict,
  });
};
