"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = require("../errors/AppError");
const prisma_1 = require("../prisma");
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError_1.AppError("Email and password required", 400);
    }
    const ipAddress = req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        null;
    const userAgent = req.headers["user-agent"] || null;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    // ❌ USER TIDAK ADA
    if (!user) {
        await prisma_1.prisma.authLog.create({
            data: {
                email,
                action: "LOGIN_FAILED",
                ipAddress,
                userAgent,
            },
        });
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const passwordValid = await bcrypt_1.default.compare(password, user.password);
    // ❌ PASSWORD SALAH
    if (!passwordValid) {
        await prisma_1.prisma.authLog.create({
            data: {
                userId: user.id,
                email,
                action: "LOGIN_FAILED",
                ipAddress,
                userAgent,
            },
        });
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    // 🔐 GENERATE JWT (SATU-SATUNYA TEMPAT SIGN)
    const accessToken = jsonwebtoken_1.default.sign({
        sub: user.id,
        role: user.role,
        email: user.email,
    }, process.env.JWT_SECRET, {
        issuer: "medrec-api",
        audience: "medrec-client",
        expiresIn: "15m",
    });
    // ✅ LOGIN BERHASIL
    await prisma_1.prisma.authLog.create({
        data: {
            userId: user.id,
            email: user.email,
            action: "LOGIN_SUCCESS",
            ipAddress,
            userAgent,
        },
    });
    return res.json({ accessToken });
}
/**
 * LOGOUT (dipanggil manual dari route)
 */
async function logout(req, res) {
    if (!req.user) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    await prisma_1.prisma.authLog.create({
        data: {
            userId: req.user.id,
            email: req.user.email,
            action: "LOGOUT",
            ipAddress: req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress ||
                null,
            userAgent: req.headers["user-agent"] || null,
        },
    });
    res.json({ success: true });
}
