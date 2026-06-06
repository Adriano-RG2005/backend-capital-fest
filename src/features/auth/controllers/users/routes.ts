import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import usersController from './controllers/users.controller';
import { loginUserValidation } from './validations/loginUser.validation';
import { registerUserValidation } from './validations/registerUser.validation';

const router: Router = Router();

router.post(
  '/register',
  requestValidator(registerUserValidation()),
  asyncMiddleware((req, res) => usersController.register(req, res)),
);

router.post(
  '/login',
  requestValidator(loginUserValidation()),
  asyncMiddleware((req, res) => usersController.login(req, res)),
);

router.get(
  '/',
  asyncMiddleware((req, res) => usersController.getAll(req, res)),
);

router.get(
  '/search',
  asyncMiddleware((req, res) => usersController.getByName(req, res)),
);

router.get(
  '/:id',
  asyncMiddleware((req, res) => usersController.getById(req, res)),
);

router.delete(
  '/',
  asyncMiddleware((req, res) => usersController.deleteAll(req, res)),
);

export default router;
