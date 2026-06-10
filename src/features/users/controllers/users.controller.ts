import type { Request, Response } from 'express';
import { UserRepository } from '@/database/repositories/userRepository';
import { login } from './login';
import { register } from './register';
import { getAll } from './getAll';
import { getById } from './getById';
import { getByName } from './getByName';
import { deleteAll } from './deleteAll';

export class UsersController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(req: Request, res: Response): Promise<void> {
    await register(req, res, this.userRepository);
  }

  async login(req: Request, res: Response): Promise<void> {
    await login(req, res, this.userRepository);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    await getAll(req, res, this.userRepository);
  }

  async getById(req: Request, res: Response): Promise<void> {
    await getById(req, res, this.userRepository);
  }

  async getByName(req: Request, res: Response): Promise<void> {
    await getByName(req, res, this.userRepository);
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    await deleteAll(req, res, this.userRepository);
  }
}

export default new UsersController();
