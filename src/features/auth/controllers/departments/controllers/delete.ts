import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DepartmentRepository } from '@/database/repositories/departmentRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const remove = async (
  req: Request,
  res: Response,
  departmentRepository: DepartmentRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de departamento no válido');
  }

  const existingDepartment = await departmentRepository.findById(id);
  if (!existingDepartment) {
    throw new NotFoundException('Departamento no encontrado');
  }

  try {
    await departmentRepository.delete(id);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      throw new HttpException(
        StatusCodes.CONFLICT,
        'No se puede eliminar el departamento porque tiene registros asociados (provincias o usuarios)',
      );
    }
    throw error;
  }

  res.status(StatusCodes.OK).send({
    message: 'Departamento eliminado exitosamente',
  });
};