import { Router } from 'express';
import { asyncMiddleware } from '@/middlewares/async.middleware';
import { BanksController } from './controllers/banks.controller';

const router: Router = Router();
const banksController = new BanksController();

router.get(
  '/',
  asyncMiddleware((req, res) => banksController.getAllBanks(req, res)),
);

export default router;
