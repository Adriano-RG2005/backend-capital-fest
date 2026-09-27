import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireAdmin } from '@/middlewares/role.middleware';
import {
  activity,
  cardDetail,
  cards,
  dashboard,
  operationDetail,
  operations,
  updateOperationStatus,
  updateUserStatus,
  updateValidation,
  userDetail,
  users,
  validations,
} from './controller';

const router = Router();
router.use(requireAuth, asyncMiddleware(requireAdmin));
router.get('/dashboard', asyncMiddleware(dashboard));
router.get('/users', asyncMiddleware(users));
router.get('/users/:id', asyncMiddleware(userDetail));
router.patch('/users/:userId/status', asyncMiddleware(updateUserStatus));
router.get('/operations', asyncMiddleware(operations));
router.get('/operations/:id', asyncMiddleware(operationDetail));
router.patch('/operations/:id/status', asyncMiddleware(updateOperationStatus));
router.get('/cards', asyncMiddleware(cards));
router.get('/cards/:cardId', asyncMiddleware(cardDetail));
router.get('/validations', asyncMiddleware(validations));
router.patch('/validations/:validationId', asyncMiddleware(updateValidation));
router.get('/activity', asyncMiddleware(activity));
export default router;
