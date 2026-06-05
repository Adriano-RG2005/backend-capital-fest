import compression from 'compression';
import express, { type Application } from 'express';
import helmet from 'helmet';
import NotFoundException from '@/exceptions/NotFoundException';
import authRoutes from '@/features/auth/routes';
import healthcheckRoutes from '@/features/healthcheck/routes';
import { errorHandler } from '@/middlewares/error-handler.middleware';

const app: Application = express();

app.use(helmet(), compression(), express.json(), express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/healthcheck', healthcheckRoutes);

app.use(() => {
  throw new NotFoundException();
});

app.use(errorHandler);

export default app;
