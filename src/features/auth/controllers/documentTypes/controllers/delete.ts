import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const remove = async (
  req: Request,
  res: Response,
  documentTypesRepository: DocumentTypesRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de tipo de documento no válido');
  }

  const existingDocumentType = await documentTypesRepository.findById(id);
  if (!existingDocumentType) {
    throw new NotFoundException('Tipo de documento no encontrado');
  }

  try {
    await documentTypesRepository.delete(id);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      throw new HttpException(StatusCodes.CONFLICT, 'No se puede eliminar el tipo de documento porque tiene usuarios asociados');
    }
    throw error;
  }

  res.status(StatusCodes.OK).send({
    message: 'Tipo de documento eliminado exitosamente',
  });
};
