import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DepartmentRepository } from '@/database/repositories/departmentRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const update = async (
  req: Request,
  res: Response,
  departmentRepository: DepartmentRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de departamento no válido');
  }

  const { name } = req.body;

  const existingDepartment = await departmentRepository.findById(id);
  if (!existingDepartment) {
    throw new NotFoundException('Departamento no encontrado');
  }

  const duplicateName = await departmentRepository.findByName(name);
  if (duplicateName && duplicateName.id !== id) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe otro departamento con ese nombre');
  }

  const updatedDepartment = await departmentRepository.update(id, { name });

  res.status(StatusCodes.OK).send({
    message: 'Departamento actualizado exitosamente',
    data: updatedDepartment,
  });
};