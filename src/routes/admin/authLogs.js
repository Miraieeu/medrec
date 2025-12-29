"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin/authLogs.ts
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const router = (0, express_1.Router)();
/**
 * GET /api/admin/auth-logs
 * Login / Logout / Failed login
 */
router.get("/", async (_req, res) => {
    const logs = await prisma_1.prisma.authLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    res.json({
        success: true,
        data: logs,
    });
});
exports.default = router;
