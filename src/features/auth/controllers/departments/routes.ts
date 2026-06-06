import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import departmentController from './controllers/department.controller';
import { createDepartmentValidation } from './validations/createDepartment.validation';
import { updateDepartmentValidation } from './validations/updateDepartment.validation';

const router: Router = Router();

router.post(
  '/',
  requestValidator(createDepartmentValidation()),
  asyncMiddleware((req, res) => departmentController.create(req, res)),
);

router.get(
  '/',
  asyncMiddleware((req, res) => departmentController.findAll(req, res)),
);

router.get(
  '/:id',
  asyncMiddleware((req, res) => departmentController.findById(req, res)),
);

router.put(
  '/:id',
  requestValidator(updateDepartmentValidation()),
  asyncMiddleware((req, res) => departmentController.update(req, res)),
);

router.delete(
  '/:id',
  asyncMiddleware((req, res) => departmentController.delete(req, res)),
);

export default router;
