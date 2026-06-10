import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DepartmentRepository } from '@/database/repositories/departmentRepository';
import NotFoundException from '@/exceptions/NotFoundException';

export const findById = async (
  req: Request,
  res: Response,
  departmentRepository: DepartmentRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de departamento no válido');
  }

  const department = await departmentRepository.findById(id);
  if (!department) {
    throw new NotFoundException('Departamento no encontrado');
  }

  res.status(StatusCodes.OK).send({
    message: 'Departamento obtenido exitosamente',
    data: department,
  });
};