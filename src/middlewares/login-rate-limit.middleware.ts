import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '@/exceptions/HttpException';
const attempts = new Map<string, { count: number; resetAt: number }>();
export const loginRateLimit = (req: Request, _res: Response, next: NextFunction): void => {
  const key = `${req.ip}:${String(req.body?.email || '').toLowerCase()}`;
  const current = attempts.get(key);
  if (!current || current.resetAt < Date.now()) { attempts.set(key, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 }); next(); return; }
  if (current.count >= 10) throw new HttpException(StatusCodes.TOO_MANY_REQUESTS, 'Demasiados intentos de inicio de sesión');
  current.count += 1; next();
};
