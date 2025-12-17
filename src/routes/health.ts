import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "medrec-api",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
