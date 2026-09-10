import compression from "compression";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import NotFoundException from "@/exceptions/NotFoundException";
import authRoutes from "@/features/users/routes";
import departmentRoutes from "@/features/departments/routes";
import districtRoutes from "@/features/districts/routes";
import healthcheckRoutes from "@/features/healthcheck/routes";
import documentTypeRoutes from "@/features/documentTypes/routes";
import provinceRoutes from "@/features/provinces/routes";
import bankRoutes from "@/features/banks/routes";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import enviroment from "@/config/enviroment";
import cardRoutes from "@/features/cards/routes";
import simulationRoutes, { withdrawalRouter } from "@/features/simulations/routes";
import dashboardRoutes from "@/features/dashboard/routes";
import operationRoutes from "@/features/operations/routes";
import notificationRoutes from "@/features/notifications/routes";
import adminRoutes from "@/features/admin/routes";

const app: Application = express();
const allowedOrigins = enviroment.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(
  helmet(),
  compression(),
  express.json(),
  express.urlencoded({ extended: true }),
);

app.use("/api/auth", authRoutes);
app.use("/api/healthcheck", healthcheckRoutes);
app.use("/api/document-types", documentTypeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/withdrawals", withdrawalRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/operations", operationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use(() => {
  throw new NotFoundException();
});

app.use(errorHandler);

export default app;
