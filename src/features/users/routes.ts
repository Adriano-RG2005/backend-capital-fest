import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requestValidator } from '@/middlewares/request-validator.middleware';
import usersController from './controllers/users.controller';
import { loginUserValidation } from './validations/loginUser.validation';
import { registerUserValidation } from './validations/registerUser.validation';
import { requireAuth } from '@/middlewares/auth.middleware';
import { loginRateLimit } from '@/middlewares/login-rate-limit.middleware';
import { getProfile, updateProfile } from './controllers/profile';
import { logout } from './controllers/logout';
import { forgotPassword, resetPassword } from './controllers/password';

const router: Router = Router();

router.post(
  '/register',
  requestValidator(registerUserValidation()),
  asyncMiddleware((req, res) => usersController.register(req, res)),
);

router.post(
  '/login',
  loginRateLimit,
  requestValidator(loginUserValidation()),
  asyncMiddleware((req, res) => usersController.login(req, res)),
);

router.post('/logout', requireAuth, asyncMiddleware(logout));
router.post('/forgot-password', asyncMiddleware(forgotPassword));
router.post('/reset-password', asyncMiddleware(resetPassword));
router.get('/profile', requireAuth, asyncMiddleware(getProfile));
router.patch('/profile', requireAuth, asyncMiddleware(updateProfile));

router.get(
  '/',
  requireAuth,
  asyncMiddleware((req, res) => usersController.getAll(req, res)),
);

router.get(
  '/search',
  requireAuth,
  asyncMiddleware((req, res) => usersController.getByName(req, res)),
);

router.get(
  '/:id',
  requireAuth,
  asyncMiddleware((req, res) => usersController.getById(req, res)),
);

router.delete(
  '/',
  requireAuth,
  asyncMiddleware((req, res) => usersController.deleteAll(req, res)),
);

export default router;
