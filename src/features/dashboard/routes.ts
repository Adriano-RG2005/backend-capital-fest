import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { requireAuth } from '@/middlewares/auth.middleware';
import { summary, chart } from './controller';
const router = Router();
router.use(requireAuth);
router.get('/summary', asyncMiddleware(summary));
router.get('/chart', asyncMiddleware(chart));
export default router;
