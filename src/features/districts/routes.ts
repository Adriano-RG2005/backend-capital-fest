import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import districtController from './controllers/district.controller';
import { createDistrictValidation } from './validations/createDistrict.validation';
import { updateDistrictValidation } from './validations/updateDistrict.validation';

const router: Router = Router();

router.post(
  '/',
  requestValidator(createDistrictValidation()),
  asyncMiddleware((req, res) => districtController.create(req, res)),
);

router.get(
  '/',
  asyncMiddleware((req, res) => districtController.findAll(req, res)),
);

router.get(
  '/:id',
  asyncMiddleware((req, res) => districtController.findById(req, res)),
);

router.put(
  '/:id',
  requestValidator(updateDistrictValidation()),
  asyncMiddleware((req, res) => districtController.update(req, res)),
);

router.delete(
  '/:id',
  asyncMiddleware((req, res) => districtController.delete(req, res)),
);

export default router;
