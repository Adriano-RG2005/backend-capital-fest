import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body.email || '').toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(StatusCodes.OK).json({ message: 'Si el correo existe, recibirás instrucciones.' }); return; }
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
  res.status(StatusCodes.OK).json({ message: 'Si el correo existe, recibirás instrucciones.', ...(process.env.NODE_ENV !== 'production' ? { resetToken: token } : {}) });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  if (password.length < 8) throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'La contraseña debe tener al menos 8 caracteres');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const reset = await prisma.passwordResetToken.findFirst({ where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } } });
  if (!reset) throw new HttpException(StatusCodes.BAD_REQUEST, 'Token de recuperación inválido o expirado');
  await prisma.$transaction([prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }), prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })]);
  res.status(StatusCodes.OK).json({ message: 'Contraseña actualizada' });
};
