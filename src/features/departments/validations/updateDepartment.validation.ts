import { body, type ValidationChain } from 'express-validator';

export const updateDepartmentValidation = (): ValidationChain[] => {
  return [
    body('name')
      .exists()
      .withMessage('El campo "name" es requerido')
      .notEmpty()
      .withMessage('El campo "name" no puede estar vacío')
      .isString()
      .withMessage('El campo "name" debe ser una cadena de texto'),
  ];
};
