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
    body('documentFrontUrl').optional().isString().withMessage('El campo "documentFrontUrl" debe ser una cadena de texto'),
    body('documentBackUrl').optional().isString().withMessage('El campo "documentBackUrl" debe ser una cadena de texto'),
    body('selfieWithDocumentUrl')
      .optional()
      .isString()
      .withMessage('El campo "selfieWithDocumentUrl" debe ser una cadena de texto'),
    body('bankAccounts').optional().isArray().withMessage('El campo "bankAccounts" debe ser un arreglo'),
    body('bankAccounts.*.bankId')
      .optional()
      .isInt()
      .withMessage('El campo "bankAccounts.bankId" debe ser un número entero'),
    body('bankAccounts.*.accountHolderName')
      .optional()
      .isString()
      .withMessage('El campo "bankAccounts.accountHolderName" debe ser una cadena de texto'),
    body('bankAccounts.*.accountNumber')
      .optional()
      .isString()
      .withMessage('El campo "bankAccounts.accountNumber" debe ser una cadena de texto'),
    body('cards').optional().isArray().withMessage('El campo "cards" debe ser un arreglo'),
    body('cards.*.bankId').optional().isInt().withMessage('El campo "cards.bankId" debe ser un número entero'),
    body('cards.*.lastFourDigits')
      .optional()
      .isLength({ min: 4, max: 4 })
      .withMessage('El campo "cards.lastFourDigits" debe tener exactamente 4 dígitos'),
    body('cards.*.cardFrontImageUrl')
      .optional()
      .isString()
      .withMessage('El campo "cards.cardFrontImageUrl" debe ser una cadena de texto'),
    body('cards.*.cardBackImageUrl')
      .optional()
      .isString()
      .withMessage('El campo "cards.cardBackImageUrl" debe ser una cadena de texto'),
  ];
};
