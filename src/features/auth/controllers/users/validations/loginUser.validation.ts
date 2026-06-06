import { body, type ValidationChain } from 'express-validator';

export const loginUserValidation = (): ValidationChain[] => {
  return [
    body('email')
      .exists()
      .withMessage('El campo "email" es requerido')
      .isEmail()
      .withMessage('El campo "email" no es un correo válido'),
    body('password')
      .exists()
      .withMessage('El campo "password" es requerido')
      .notEmpty()
      .withMessage('El campo "password" no puede estar vacío'),
  ];
};
