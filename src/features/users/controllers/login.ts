import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { UserRepository } from '@/database/repositories/userRepository';
import HttpException from '@/exceptions/HttpException';

export const login = async (req: Request, res: Response, userRepository: UserRepository): Promise<void> => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Credenciales incorrectas');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, 'Credenciales incorrectas');
  }

  if (user.accountStatus === 'blocked' || user.accountStatus === 'pending_verification') {
    throw new HttpException(StatusCodes.FORBIDDEN, 'La cuenta no está habilitada');
  }

  const jwtSecret = process.env.JWT_SECRET || 'super-secret-key';
  const token = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.roleId },
    jwtSecret,
    { expiresIn: '1d' }
  );

  res.status(StatusCodes.OK).send({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, roleId: user.roleId, status: 'verified' },
  });
};
