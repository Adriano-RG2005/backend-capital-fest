import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRepository } from '@/database/repositories/userRepository';
import HttpException from '@/exceptions/HttpException';

class RegisterUserController {
  constructor(private userRepository: UserRepository) {}

  async execute(req: Request, res: Response): Promise<void> {
    // 1. Validar y extraer datos del request body
    const {
      firstName,
      lastName,
      email,
      password,
      birthDate,
      phone,
      documentTypeId,
      documentNumber,
      roleId = 1, // Asumimos un rol por defecto si no se envía
      departmentId,
      provinceId,
      districtId,
      address,
    } = req.body;

    // 1. Verificar si el usuario ya existe por email
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new HttpException(StatusCodes.BAD_REQUEST, 'El correo electrónico ya está registrado');
    }

    // 2. Verificar si el usuario ya existe por número de documento
    const existingUserByDoc = await this.userRepository.findByDocumentNumber(documentNumber);
    if (existingUserByDoc) {
      throw new HttpException(StatusCodes.BAD_REQUEST, 'El número de documento ya está registrado');
    }

    // 3. Hash del password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Crear el usuario
    const user = await this.userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      birthDate: new Date(birthDate),
      phone,
      documentTypeId: Number(documentTypeId),
      documentNumber,
      roleId: Number(roleId),
      departmentId: Number(departmentId),
      provinceId: Number(provinceId),
      districtId: Number(districtId),
      address,  
    });

    // 5. Responder (sin incluir el passwordHash)
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(StatusCodes.CREATED).send({
      message: 'Usuario registrado exitosamente',
      data: userWithoutPassword,
    });
  }
}

const registerUserController = new RegisterUserController(new UserRepository());

export default registerUserController;
