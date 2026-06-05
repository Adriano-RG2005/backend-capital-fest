import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import loginController from './controllers/login.controller';
import registerUserController from './controllers/registerUser.controller';
import { registerUserValidation } from './validations/registerUser.validation';

const router: Router = Router();

router.post(
  '/register',
  requestValidator(registerUserValidation()),
  asyncMiddleware((req, res) => registerUserController.execute(req, res)),
);

router.post('/login', (req, res) => loginController.execute(req, res));

export default router;
