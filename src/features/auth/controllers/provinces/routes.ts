import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import provinceController from './controllers/province.controller';
import { createProvinceValidation } from './validations/createProvince.validation';
import { updateProvinceValidation } from './validations/updateProvince.validation';

const router: Router = Router();

router.post(
  '/',
  requestValidator(createProvinceValidation()),
  asyncMiddleware((req, res) => provinceController.create(req, res)),
);

router.get(
  '/',
  asyncMiddleware((req, res) => provinceController.findAll(req, res)),
);

router.get(
  '/:id',
  asyncMiddleware((req, res) => provinceController.findById(req, res)),
);

router.put(
  '/:id',
  requestValidator(updateProvinceValidation()),
  asyncMiddleware((req, res) => provinceController.update(req, res)),
);

router.delete(
  '/:id',
  asyncMiddleware((req, res) => provinceController.delete(req, res)),
);

export default router;
