import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const login = async (_req: Request, res: Response): Promise<void> => {
  res.status(StatusCodes.OK).send({
    message: 'Login OK',
    data: new Date().toJSON(),
  });
};