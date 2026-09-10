import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { createSimulation, listSimulations, getSimulation, createWithdrawal } from './controller';

const router = Router();
router.use(requireAuth);
router.post('/', asyncMiddleware(createSimulation));
router.get('/', asyncMiddleware(listSimulations));
router.get('/:id', asyncMiddleware(getSimulation));
export default router;

export const withdrawalRouter = Router();
withdrawalRouter.use(requireAuth);
withdrawalRouter.post('/', asyncMiddleware(createWithdrawal));
