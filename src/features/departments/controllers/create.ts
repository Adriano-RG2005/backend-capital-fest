import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DepartmentRepository } from '@/database/repositories/departmentRepository';
import HttpException from '@/exceptions/HttpException';

export const create = async (
  req: Request,
  res: Response,
  departmentRepository: DepartmentRepository,
): Promise<void> => {
  const { id, name } = req.body;

  const existingDepartment = await departmentRepository.findById(Number(id));
  if (existingDepartment) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'El departamento ya está registrado');
  }

  const existingByName = await departmentRepository.findByName(name);
  if (existingByName) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe un departamento con ese nombre');
  }

  const department = await departmentRepository.create({
    id: Number(id),
    name,
  });

  res.status(StatusCodes.CREATED).send({
    message: 'Departamento creado exitosamente',
    data: department,
  });
};