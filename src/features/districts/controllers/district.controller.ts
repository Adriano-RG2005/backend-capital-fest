import type { Request, Response } from 'express';
import { DistrictRepository } from '@/database/repositories/districtRepository';
import { create } from './create';
import { remove } from './delete';
import { findAll } from './findAll';
import { findById } from './findById';
import { update } from './update';

class DistrictController {

  private districtRepository = new DistrictRepository();

  async create(req: Request, res: Response): Promise<void> {
    await create(req, res, this.districtRepository);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    await findAll(req, res, this.districtRepository);
  }

  async findById(req: Request, res: Response): Promise<void> {
    await findById(req, res, this.districtRepository);
  }

  async update(req: Request, res: Response): Promise<void> {
    await update(req, res, this.districtRepository);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await remove(req, res, this.districtRepository);
  }
}

const districtController = new DistrictController();

export default districtController;
