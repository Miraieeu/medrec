import "./types";
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { authJWT } from "./middleware/authJWT";
import { requireRole } from "./middleware/requireRole";
import { errorHandler } from "./middleware/errorHandler";

// ROUTES (RESOURCE ONLY)
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import patientRoutes from "./routes/patients";
import queueRoutes from "./routes/queues";
import recordRoutes from "./routes/records";
import auditLogRoutes from "./routes/auditLogs";

// 🔐 GUARD JWT SECRET
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * ======================
 * GLOBAL MIDDLEWARE
 * ======================
 */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

/**
 * ======================
 * SWAGGER
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
 * ROLE-BASED GROUP ROUTERS
 * ======================
 */

// REGISTRATION
const registrationRouter = express.Router();
registrationRouter.use(authJWT, requireRole(["registration"]));

registrationRouter.use("/patients", patientRoutes);
registrationRouter.use("/queues", queueRoutes);

app.use("/api/registration", registrationRouter);

// NURSE
const nurseRouter = express.Router();
nurseRouter.use(authJWT, requireRole(["nurse"]));

nurseRouter.use("/queues", queueRoutes);
nurseRouter.use("/records", recordRoutes);

app.use("/api/nurse", nurseRouter);

// DOCTOR
const doctorRouter = express.Router();

doctorRouter.use(authJWT, requireRole(["doctor"]));
doctorRouter.use("/queues", queueRoutes);
doctorRouter.use("/records", recordRoutes);

app.use("/api/doctor", doctorRouter);

// ADMIN
const adminRouter = express.Router();

adminRouter.use(authJWT, requireRole(["admin"]));
adminRouter.use("/auditLogs", auditLogRoutes);

app.use("/api/admin", adminRouter);

/**
 * ======================
 * ERROR HANDLER (LAST)
 * ======================
 */
app.use(errorHandler);

/**
 * ======================
 * SERVER START
 * ======================
 */
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs on http://localhost:${PORT}/api/docs`);
});
