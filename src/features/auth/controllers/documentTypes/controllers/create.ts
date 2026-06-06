import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';
import HttpException from '@/exceptions/HttpException';

export const create = async (
  req: Request,
  res: Response,
  documentTypesRepository: DocumentTypesRepository,
): Promise<void> => {
  const { name, code } = req.body;

  const existingByName = await documentTypesRepository.findByName(name);
  if (existingByName) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe un tipo de documento con ese nombre');
  }

  if (code) {
    const existingByCode = await documentTypesRepository.findByCode(code);
    if (existingByCode) {
      throw new HttpException(StatusCodes.BAD_REQUEST, 'Ya existe un tipo de documento con ese código');
    }
  }

  const documentType = await documentTypesRepository.create({
    name,
    code,
  });

  res.status(StatusCodes.CREATED).send({
    message: 'Tipo de documento creado exitosamente',
    data: documentType,
  });
};
