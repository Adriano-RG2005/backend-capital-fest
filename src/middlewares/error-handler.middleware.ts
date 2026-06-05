import type { NextFunction, Request, Response } from 'express';
import type { ValidationError } from 'express-validator';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import enviroment from '@/config/enviroment';
import HttpException from '@/exceptions/HttpException';
import UnprocessableEntity from '@/exceptions/UnprocessableEntity';

const { ENV } = enviroment;

interface IResponseError {
  code: number;
  message: string;
  stack?: string;
  errors?: ValidationError[];
}

export const errorHandler = (error: Error | HttpException, _: Request, res: Response, __: NextFunction): void => {
  let response: IResponseError;

  if (error instanceof HttpException) {
    response = {
      code: error.status,
      message: error.message,
    };

    if (error instanceof UnprocessableEntity && response.code === StatusCodes.UNPROCESSABLE_ENTITY) {
      response.errors = error.errors;
    }
  } else {
    response = {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    };
  }

  if (ENV === 'development') {
    response.stack = error.stack;
    console.error(error);
  }

  res.status(response.code).json(response);
};
