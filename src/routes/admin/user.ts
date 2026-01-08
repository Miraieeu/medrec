import { Router } from "express";
import { prisma } from "../../prisma";
import { AppError } from "../../errors/AppError";
import { Role, AuditAction } from "@prisma/client";
import bcrypt from "bcrypt";
import { createAuditLog } from "../../services/auditLog.service";

const router = Router();

/**
 * =======================
 * GET /api/admin/users
 * =======================
 */
router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
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
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);

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
    throw new AppError("email, password, role required", 400);
  }

  if (!Object.values(Role).includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError("Email already exists", 409);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role,
    },
  });

  // 🔐 AUDIT: CREATE USER
  await createAuditLog({
    userId: req.user!.id,
    action: AuditAction.CREATE_USER,
    entity: "User",
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
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
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);

  const { name, role, password } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const data: any = {};
  const metadata: any = {};

  if (name && name !== user.name) {
    data.name = name;
    metadata.name = { before: user.name, after: name };
  }

  if (role) {
    if (!Object.values(Role).includes(role)) {
      throw new AppError("Invalid role", 400);
    }
    if (role !== user.role) {
      data.role = role;
      metadata.role = { before: user.role, after: role };
    }
  }

  if (password) {
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }
    data.password = await bcrypt.hash(password, 10);
    metadata.passwordChanged = true;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError("No changes provided", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  // 🔐 AUDIT: UPDATE USER
  await createAuditLog({
    userId: req.user!.id,
    action: AuditAction.UPDATE_USER,
    entity: "User",
    entityId: userId,
    metadata,
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
  if (isNaN(userId)) throw new AppError("Invalid user id", 400);

  if (userId === req.user!.id) {
    throw new AppError("Cannot delete your own account", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  await prisma.user.delete({ where: { id: userId } });

  // 🔐 AUDIT: DELETE USER
  await createAuditLog({
    userId: req.user!.id,
    action: AuditAction.DELETE_USER,
    entity: "User",
    entityId: userId,
    metadata: {
      email: user.email,
      role: user.role,
    },
  });

  res.json({ success: true });
});

/**
 * =======================
 * PATCH /api/admin/users/:id/password
 * RESET PASSWORD
 * =======================
 */
router.patch("/:id/password", async (req, res) => {
  const userId = Number(req.params.id);
  const { password } = req.body;

  if (isNaN(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  if (!password || password.length < 4) {
    throw new AppError("Password must be at least 4 characters", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
    },
  });

  // 🔐 AUDIT: RESET PASSWORD
  await createAuditLog({
    userId: req.user!.id,
    action: AuditAction.UPDATE_USER,
    entity: "User",
    entityId: userId,
    metadata: {
      passwordChanged: true,
    },
  });

  res.json({
    success: true,
    message: "Password updated",
    userId,
  });
});

export default router;
