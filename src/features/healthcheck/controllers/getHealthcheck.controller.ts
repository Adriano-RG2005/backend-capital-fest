import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class GetHealthcheckController {
  execute(_: Request, res: Response): void {
    res.status(StatusCodes.OK).send({
      message: 'OK',
      data: new Date().toJSON(),
    });
  }
}

const getHealthcheckController = new GetHealthcheckController();

export default getHealthcheckController;
