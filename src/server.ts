import express from "express";
import healthRoutes from "./routes/health";
import patientRoutes from "./routes/patients";
import queueRoutes from "./routes/queues";
import recordRoutes from "./routes/records";
import auditLogRoutes from "./routes/auditLogs";
import authRoutes from "./routes/auth";
import { authJWT } from "./middleware/authJWT";
import { authMiddleware } from "./middleware/auth";


const app = express();

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);

// 🔒 protected routes
app.use("/api/queues", authJWT, queueRoutes);
app.use("/api/records", authJWT, recordRoutes);
app.use("/api/auditLogs", authJWT, auditLogRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/auditLogs", auditLogRoutes);

app.listen(3000, () => {
  console.log("🚀 API running on http://localhost:3000");
});
