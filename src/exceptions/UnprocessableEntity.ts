import type { ValidationError } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import HttpException from './HttpException';

export default class UnprocessableEntity extends HttpException {
  constructor(
    message = 'Unprocessable entity',
    public errors: ValidationError[],
  ) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message);
  }
}
