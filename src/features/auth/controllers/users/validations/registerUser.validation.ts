import { body, type ValidationChain } from 'express-validator';

export const registerUserValidation = (): ValidationChain[] => {
  return [
    body('firstName')
      .exists()
      .withMessage('El campo "firstName" es requerido')
      .notEmpty()
      .withMessage('El campo "firstName" no puede estar vacío'),
    body('lastName')
      .exists()
      .withMessage('El campo "lastName" es requerido')
      .notEmpty()
      .withMessage('El campo "lastName" no puede estar vacío'),
    body('email')
      .exists()
      .withMessage('El campo "email" es requerido')
      .isEmail()
      .withMessage('El campo "email" no es un correo válido'),
    body('password')
      .exists()
      .withMessage('El campo "password" es requerido')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('birthDate')
      .exists()
      .withMessage('El campo "birthDate" es requerido')
      .isISO8601()
      .withMessage('El campo "birthDate" debe ser una fecha válida'),
    body('phone').exists().withMessage('El campo "phone" es requerido'),
    body('documentTypeId')
      .exists()
      .withMessage('El campo "documentTypeId" es requerido')
      .isInt()
      .withMessage('El campo "documentTypeId" debe ser un número entero'),
    body('documentNumber').exists().withMessage('El campo "documentNumber" es requerido'),
    body('roleId').optional().isInt().withMessage('El campo "roleId" debe ser un número entero'),
  ];
};
