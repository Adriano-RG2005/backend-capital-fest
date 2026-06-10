import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';
import HttpException from '@/exceptions/HttpException';
import NotFoundException from '@/exceptions/NotFoundException';

export const update = async (
  req: Request,
  res: Response,
  documentTypesRepository: DocumentTypesRepository,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new NotFoundException('ID de tipo de documento no válido');
  }

  const { name, code } = req.body;

  const existingDocumentType = await documentTypesRepository.findById(id);
  if (!existingDocumentType) {
    throw new NotFoundException('Tipo de documento no encontrado');
  }

  const duplicateName = await documentTypesRepository.findByName(name);
  if (duplicateName && duplicateName.id !== id) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe otro tipo de documento con ese nombre');
  }

  if (code) {
    const duplicateCode = await documentTypesRepository.findByCode(code);
    if (duplicateCode && duplicateCode.id !== id) {
      throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe otro tipo de documento con ese código');
    }
  }

  const updatedDocumentType = await documentTypesRepository.update(id, {
    name,
    code,
  });

  res.status(StatusCodes.OK).send({
    message: 'Tipo de documento actualizado exitosamente',
    data: updatedDocumentType,
  });
};
