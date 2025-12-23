"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authJWT = authJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../errors/AppError");
function authJWT(req, _res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        throw new AppError_1.AppError("Missing token", 401);
    }
    const token = auth.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("sub" in decoded) ||
            !("role" in decoded)) {
            throw new AppError_1.AppError("Invalid token payload", 401);
        }
        const payload = decoded;
        if (!payload.sub || !payload.role) {
            throw new AppError_1.AppError("Invalid token payload", 401);
        }
        req.user = {
            id: payload.sub,
            role: payload.role,
            email: payload.email,
        };
        next();
    }
    catch {
        throw new AppError_1.AppError("Invalid token", 401);
    }
}
