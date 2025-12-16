import express from "express";
import healthRoutes from "./routes/health";
import patientRoutes from "./routes/patients";
import queueRoutes from "./routes/queues";
import recordRoutes from "./routes/records";
import { fakeAuth } from "./middleware/auth";

const app = express();

app.use(express.json());
app.use(fakeAuth);

// ROUTES
app.use("/api/health", healthRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/records", recordRoutes);

app.listen(3000, () => {
  console.log("🚀 API running on http://localhost:3000");
});
