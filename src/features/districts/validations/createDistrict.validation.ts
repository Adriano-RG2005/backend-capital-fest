import { body, type ValidationChain } from 'express-validator';

export const createDistrictValidation = (): ValidationChain[] => {
  return [
    body('id')
      .exists()
      .withMessage('El campo "id" es requerido')
      .isInt()
      .withMessage('El campo "id" debe ser un número entero'),
    body('name')
      .exists()
      .withMessage('El campo "name" es requerido')
      .notEmpty()
      .withMessage('El campo "name" no puede estar vacío')
      .isString()
      .withMessage('El campo "name" debe ser una cadena de texto'),
    body('provinceId')
      .exists()
      .withMessage('El campo "provinceId" es requerido')
      .isInt()
      .withMessage('El campo "provinceId" debe ser un número entero'),
  ];
};
