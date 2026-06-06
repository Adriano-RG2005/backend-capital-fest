import { Router } from 'express';
import getHealthcheckController from './controllers/getHealthcheck.controller';

const router: Router = Router();

router.get('/', getHealthcheckController.execute);

export default router;
