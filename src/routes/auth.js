"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const authJWT_1 = require("../middleware/authJWT");
const router = (0, express_1.Router)();
// Router Login
router.post("/login", auth_service_1.login);
router.post("/logout", authJWT_1.authJWT, auth_service_1.logout);
exports.default = router;
