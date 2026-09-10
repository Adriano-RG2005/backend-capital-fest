import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { listCards, getCard, createCard, changeCardStatus, removeCard, listCardTransactions } from './controller';

const router = Router();
router.use(requireAuth);
router.get('/', asyncMiddleware(listCards));
router.get('/:id', asyncMiddleware(getCard));
router.post('/', asyncMiddleware(createCard));
router.patch('/:id/lock', asyncMiddleware((req, res) => changeCardStatus(req, res, 'locked')));
router.patch('/:id/unlock', asyncMiddleware((req, res) => changeCardStatus(req, res, 'active')));
router.delete('/:id', asyncMiddleware(removeCard));
router.get('/:id/transactions', asyncMiddleware(listCardTransactions));
export default router;
