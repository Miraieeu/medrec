import dotenv from "dotenv";

import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cors from "cors";

import healthRoutes from "./routes/health";
import patientRoutes from "./routes/patients";
import queueRoutes from "./routes/queues";
import recordRoutes from "./routes/records";
import auditLogRoutes from "./routes/auditLogs";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(errorHandler);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

/**
 * ======================
 * SWAGGER DOCS
 * ======================
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * ======================
 * PUBLIC ROUTES
 * ======================
 */
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

/**
 * ======================
 * PROTECTED ROUTES (JWT)
 * ======================
 */
app.use("/api/patients", patientRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/auditLogs", auditLogRoutes);

/**
 * ======================
 * SERVER START
 * ======================
 */

app.listen(PORT, () => {
  console.log("PWD =", process.cwd());
  console.log("SECRET =", process.env.NEXTAUTH_SECRET);

  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs on http://localhost:${PORT}/api/docs`);
});
