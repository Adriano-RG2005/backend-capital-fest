import type { Request, Response } from 'express';
import { DocumentTypesRepository } from '@/database/repositories/documentTypesRepository';
import { create } from './create';
import { remove } from './delete';
import { findAll } from './findAll';
import { findById } from './findById';
import { update } from './update';

class DocumentTypeController {
  private documentTypesRepository = new DocumentTypesRepository();

  async create(req: Request, res: Response): Promise<void> {
    await create(req, res, this.documentTypesRepository);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    await findAll(req, res, this.documentTypesRepository);
  }

  async findById(req: Request, res: Response): Promise<void> {
    await findById(req, res, this.documentTypesRepository);
  }

  async update(req: Request, res: Response): Promise<void> {
    await update(req, res, this.documentTypesRepository);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await remove(req, res, this.documentTypesRepository);
  }
}

const documentTypeController = new DocumentTypeController();
export default documentTypeController;
