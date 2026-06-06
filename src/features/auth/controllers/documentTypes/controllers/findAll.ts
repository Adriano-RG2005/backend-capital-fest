import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';

export const findAll = async (
  _req: Request,
  res: Response,
  documentTypesRepository: DocumentTypesRepository,
): Promise<void> => {
  const documentTypes = await documentTypesRepository.findAll();

  res.status(StatusCodes.OK).send({
    message: 'Tipos de documento obtenidos exitosamente',
    data: documentTypes,
  });
};
