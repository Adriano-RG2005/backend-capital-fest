import type { NextFunction, Request, Response } from 'express';
import { type ValidationChain, validationResult } from 'express-validator';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import UnprocessableEntity from '@/exceptions/UnprocessableEntity';

export const requestValidator = (validations: ValidationChain[]) => {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new UnprocessableEntity(
        getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
        errors.array({ onlyFirstError: true }),
      );
    }

    next();
  };
};
