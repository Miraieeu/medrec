"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const AppError_1 = require("../../errors/AppError");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
/**
 * =======================
 * GET /api/admin/users
 * =======================
 */
router.get("/", async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users });
});
/**
 * =======================
 * GET /api/admin/users/:id
 * =======================
 */
router.get("/:id", async (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        throw new AppError_1.AppError("Invalid user id", 400);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    res.json({ success: true, data: user });
});
/**
 * =======================
 * POST /api/admin/users
 * CREATE USER
 * =======================
 */
router.post("/", async (req, res) => {
    const { email, password, role, name } = req.body;
    if (!email || !password || !role) {
        throw new AppError_1.AppError("email, password, role required", 400);
    }
    if (!Object.values(client_1.Role).includes(role)) {
        throw new AppError_1.AppError("Invalid role", 400);
    }
    const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (exists) {
        throw new AppError_1.AppError("Email already exists", 409);
    }
    const hashed = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            name,
            password: hashed,
            role, // ⬅️ TANPA id
        },
    });
    res.status(201).json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
});
/**
 * =======================
 * PATCH /api/admin/users/:id
 * UPDATE USER
 * =======================
 */
router.patch("/:id", async (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        throw new AppError_1.AppError("Invalid user id", 400);
    const { name, role, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    const data = {};
    const metadata = {};
    if (name && name !== user.name) {
        data.name = name;
        metadata.name = { before: user.name, after: name };
    }
    if (role) {
        if (!Object.values(client_1.Role).includes(role)) {
            throw new AppError_1.AppError("Invalid role", 400);
        }
        if (role !== user.role) {
            data.role = role;
            metadata.role = { before: user.role, after: role };
        }
    }
    if (password) {
        if (password.length < 6) {
            throw new AppError_1.AppError("Password must be at least 6 characters", 400);
        }
        data.password = await bcrypt_1.default.hash(password, 10);
        metadata.passwordChanged = true;
    }
    if (Object.keys(data).length === 0) {
        throw new AppError_1.AppError("No changes provided", 400);
    }
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data,
    });
    await prisma_1.prisma.auditLog.create({
        data: {
            userId: req.user.id,
            action: client_1.AuditAction.UPDATE_USER,
            entity: "User",
            entityId: userId,
            metadata,
        },
    });
    res.json({ success: true });
});
/**
 * =======================
 * DELETE /api/admin/users/:id
 * =======================
 */
router.delete("/:id", async (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        throw new AppError_1.AppError("Invalid user id", 400);
    if (userId === req.user.id) {
        throw new AppError_1.AppError("Cannot delete your own account", 400);
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    await prisma_1.prisma.user.delete({ where: { id: userId } });
    await prisma_1.prisma.auditLog.create({
        data: {
            userId: req.user.id,
            action: client_1.AuditAction.DELETE_USER,
            entity: "User",
            entityId: userId,
            metadata: {
                email: user.email,
                role: user.role,
            },
        },
    });
    res.json({ success: true });
});
// PATCH /api/admin/users/${id}/password
router.patch("/:id/password", async (req, res) => {
    const userId = Number(req.params.id);
    const { password } = req.body;
    if (isNaN(userId)) {
        throw new AppError_1.AppError("Invalid user id", 400);
    }
    if (!password || password.length < 4) {
        throw new AppError_1.AppError("Password must be at least 4 characters", 400);
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const hashed = await bcrypt_1.default.hash(password, 10);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            password: hashed,
        },
    });
    res.json({
        success: true,
        message: "Password updated",
        userId,
    });
});
exports.default = router;
