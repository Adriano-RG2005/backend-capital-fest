import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { requireAdmin } from '@/middlewares/role.middleware';
import { dashboard, users, userDetail, updateUserStatus, operations, operationDetail, updateOperationStatus, cards, validations, updateValidation } from './controller';

const router = Router();
router.use(requireAuth, asyncMiddleware(requireAdmin));
router.get('/dashboard', asyncMiddleware(dashboard));
router.get('/users', asyncMiddleware(users));
router.get('/users/:id', asyncMiddleware(userDetail));
router.patch('/users/:id/status', asyncMiddleware(updateUserStatus));
router.get('/operations', asyncMiddleware(operations));
router.get('/operations/:id', asyncMiddleware(operationDetail));
router.patch('/operations/:id/status', asyncMiddleware(updateOperationStatus));
router.get('/cards', asyncMiddleware(cards));
router.get('/validations', asyncMiddleware(validations));
router.patch('/validations/:id', asyncMiddleware(updateValidation));
export default router;
