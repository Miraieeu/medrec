"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
exports.default = router;
