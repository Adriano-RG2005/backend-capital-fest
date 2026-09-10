import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { list, read, readAll } from './controller';
const router = Router(); router.use(requireAuth);
router.get('/', asyncMiddleware(list)); router.patch('/read-all', asyncMiddleware(readAll)); router.patch('/:id/read', asyncMiddleware(read));
export default router;
