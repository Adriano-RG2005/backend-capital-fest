import type { Request, Response } from 'express';
import { ProvinceRepository } from '@/database/repositories/provinceRepository';
import { create } from './create';
import { remove } from './delete';
import { findAll } from './findAll';
import { findById } from './findById';
import { update } from './update';

class ProvinceController {
  private provinceRepository = new ProvinceRepository();

  async create(req: Request, res: Response): Promise<void> {
    await create(req, res, this.provinceRepository);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    await findAll(req, res, this.provinceRepository);
  }

  async findById(req: Request, res: Response): Promise<void> {
    await findById(req, res, this.provinceRepository);
  }

  async update(req: Request, res: Response): Promise<void> {
    await update(req, res, this.provinceRepository);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await remove(req, res, this.provinceRepository);
  }
}

const provinceController = new ProvinceController();
export default provinceController;
