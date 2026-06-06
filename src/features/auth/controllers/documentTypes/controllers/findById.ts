import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';
import NotFoundException from '@/exceptions/NotFoundException';

export const findById = async (
  req: Request,
  res: Response,
  documentTypesRepository: DocumentTypesRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de tipo de documento no válido');
  }

  const documentType = await documentTypesRepository.findById(id);
  if (!documentType) {
    throw new NotFoundException('Tipo de documento no encontrado');
  }

  res.status(StatusCodes.OK).send({
    message: 'Tipo de documento obtenido exitosamente',
    data: documentType,
  });
};
