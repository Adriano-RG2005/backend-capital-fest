import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import documentTypeController from './controllers/documentType.controller';
import { createDocumentTypeValidation } from './validations/createDocumentType.validation';
import { updateDocumentTypeValidation } from './validations/updateDocumentType.validation';

const router: Router = Router();

router.post(
  '/',
  requestValidator(createDocumentTypeValidation()),
  asyncMiddleware((req, res) => documentTypeController.create(req, res)),
);

router.get(
  '/',
  asyncMiddleware((req, res) => documentTypeController.findAll(req, res)),
);

router.get(
  '/:id',
  asyncMiddleware((req, res) => documentTypeController.findById(req, res)),
);

router.put(
  '/:id',
  requestValidator(updateDocumentTypeValidation()),
  asyncMiddleware((req, res) => documentTypeController.update(req, res)),
);

router.delete(
  '/:id',
  asyncMiddleware((req, res) => documentTypeController.delete(req, res)),
);

export default router;
