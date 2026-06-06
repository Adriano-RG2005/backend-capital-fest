import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DepartmentRepository } from '@/database/repositories/departmentRepository';

export const findAll = async (
  _req: Request,
  res: Response,
  departmentRepository: DepartmentRepository,
): Promise<void> => {
  const departments = await departmentRepository.findAll();

  res.status(StatusCodes.OK).send({
    message: 'Departamentos obtenidos exitosamente',
    data: departments,
  });
};