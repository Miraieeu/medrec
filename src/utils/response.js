"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
function ok(res, data) {
    return res.json({
        success: true,
        data,
    });
}
function fail(res, error, status = 400) {
    return res.status(status).json({
        success: false,
        error,
    });
}
