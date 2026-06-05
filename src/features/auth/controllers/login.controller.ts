import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class LoginController {
  execute(_: Request, res: Response): void {
    res.status(StatusCodes.OK).send({
      message: 'Login OK',
      data: new Date().toJSON(),
    });
  }
}

const loginController = new LoginController();

export default loginController;
