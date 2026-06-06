import type { Request, Response } from 'express';
import { UserRepository } from '@/database/repositories/userRepository';
import { login } from './login';
import { register } from './register';

class UsersController {
  private userRepository = new UserRepository();

  async register(req: Request, res: Response): Promise<void> {
    await register(req, res, this.userRepository);
  }

  async login(req: Request, res: Response): Promise<void> {
    await login(req, res);
  }
}

const usersController = new UsersController();
export default usersController;
