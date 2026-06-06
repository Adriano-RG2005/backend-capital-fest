import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';
import HttpException from '@/exceptions/HttpException';

export const register = async (req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthDate,
    phone,
    documentTypeId,
    documentNumber,
    roleId = 1,
    departmentId,
    provinceId,
    districtId,
    address,
  } = req.body;

  const existingUserByEmail = await userRepository.findByEmail(email);
  if (existingUserByEmail) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'El correo electrónico ya está registrado');
  }

  const existingUserByDoc = await userRepository.findByDocumentNumber(documentNumber);
  if (existingUserByDoc) {
    throw new HttpException(StatusCodes.BAD_REQUEST, 'El número de documento ya está registrado');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const toNumberOrUndefined = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));

  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    passwordHash,
    birthDate: new Date(birthDate),
    phone,
    documentTypeId: Number(documentTypeId),
    documentNumber,
    roleId: Number(roleId),
    departmentId: toNumberOrUndefined(departmentId),
    provinceId: toNumberOrUndefined(provinceId),
    districtId: toNumberOrUndefined(districtId),
    address,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;

  res.status(StatusCodes.CREATED).send({
    message: 'Usuario registrado exitosamente',
    data: userWithoutPassword,
  });
};
