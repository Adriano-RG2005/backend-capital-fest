import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import usersController from './controllers/users.controller';
import { registerUserValidation } from './validations/registerUser.validation';

const router: Router = Router();

router.post(
  '/register',
  requestValidator(registerUserValidation()),
  asyncMiddleware((req, res) => usersController.register(req, res)),
);

router.post(
  '/login',
  asyncMiddleware((req, res) => usersController.login(req, res)),
);

export default router;
