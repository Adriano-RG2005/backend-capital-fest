import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { BankRepository } from '@/database/repositories/bankRepository';

export const getAllBanks = async (
  req: Request,
  res: Response,
  bankRepository: BankRepository
): Promise<void> => {
  const banks = await bankRepository.findAll();

  res.status(StatusCodes.OK).json({
    message: 'Bancos obtenidos exitosamente',
    data: banks,
  });
};
