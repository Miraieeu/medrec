"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const router = (0, express_1.Router)();
// GET /api/admin/audit-logs
router.get("/", async (_req, res) => {
    const logs = await prisma_1.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
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
