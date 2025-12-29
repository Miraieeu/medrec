"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../errors/AppError");
function errorHandler(err, _req, res, _next) {
    // Default
    let statusCode = 500;
    let message = "Internal server error";
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Log error (dev)
    if (process.env.NODE_ENV !== "production") {
        console.error("💥 ERROR:", err);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
    });
}
