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

const app: Application = express();

app.use(cors());
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

app.use(() => {
  throw new NotFoundException();
});

app.use(errorHandler);

export default app;
