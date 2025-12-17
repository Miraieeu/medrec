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

import { authJWT } from "./middleware/authJWT";
import { errorHandler } from "./middleware/errorHandler";
const app = express();

app.use(express.json());
app.use(errorHandler);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // UI dev
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
app.use("/api/patients", authJWT, patientRoutes);
app.use("/api/queues", authJWT, queueRoutes);
app.use("/api/records", authJWT, recordRoutes);
app.use("/api/auditLogs", authJWT, auditLogRoutes);

/**
 * ======================
 * SERVER START
 * ======================
 */
app.listen(3000, () => {
  console.log("🚀 API running on http://localhost:3000");
  console.log("📘 Swagger docs on http://localhost:3000/api/docs");
});
