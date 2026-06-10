import type { Request, Response } from 'express';
import { DepartmentRepository } from '@/database/repositories/departmentRepository';
import { create } from './create';
import { remove } from './delete';
import { findAll } from './findAll';
import { findById } from './findById';
import { update } from './update';

class DepartmentController {
  private departmentRepository = new DepartmentRepository();

  async create(req: Request, res: Response): Promise<void> {
    await create(req, res, this.departmentRepository);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    await findAll(req, res, this.departmentRepository);
  }

  async findById(req: Request, res: Response): Promise<void> {
    await findById(req, res, this.departmentRepository);
  }

  async update(req: Request, res: Response): Promise<void> {
    await update(req, res, this.departmentRepository);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await remove(req, res, this.departmentRepository);
  }
}

const departmentController = new DepartmentController();
export default departmentController;
