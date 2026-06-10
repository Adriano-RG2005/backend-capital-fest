import type { Request, Response } from 'express';
import { BankRepository } from '@/database/repositories/bankRepository';
import { getAllBanks } from './getAll';

export class BanksController {
  private bankRepository: BankRepository;

  constructor() {
    this.bankRepository = new BankRepository();
  }

  async getAllBanks(req: Request, res: Response): Promise<void> {
    await getAllBanks(req, res, this.bankRepository);
  }
}
