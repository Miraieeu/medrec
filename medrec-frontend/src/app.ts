import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json()); // ⬅️ INI YANG KAMU KURANG

app.use("/api/auth", authRoutes);
app.use("/api/queues", queueRoutes);
// dst
