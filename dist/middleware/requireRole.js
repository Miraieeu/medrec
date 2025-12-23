"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const AppError_1 = require("../errors/AppError");
function requireRole(allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError_1.AppError("Unauthenticated", 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError_1.AppError("Forbidden", 403);
        }
        next();
    };
}
