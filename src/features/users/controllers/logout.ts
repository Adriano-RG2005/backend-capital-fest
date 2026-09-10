import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(StatusCodes.NO_CONTENT).send();
};
