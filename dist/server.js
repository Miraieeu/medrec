"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./types");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const authJWT_1 = require("./middleware/authJWT");
const requireRole_1 = require("./middleware/requireRole");
const errorHandler_1 = require("./middleware/errorHandler");
// ROUTES
const auth_1 = __importDefault(require("./routes/auth"));
const health_1 = __importDefault(require("./routes/health"));
const patients_1 = __importDefault(require("./routes/patients"));
const queues_1 = __importDefault(require("./routes/queues"));
const records_1 = __importDefault(require("./routes/records"));
const auditLogs_1 = __importDefault(require("./routes/admin/auditLogs"));
const authLogs_1 = __importDefault(require("./routes/admin/authLogs"));
const user_1 = __importDefault(require("./routes/admin/user"));
// 🔐 GUARD JWT SECRET
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.get("/__ping", (_req, res) => {
    console.log("PING HIT");
    res.send("pong");
});
/**
 * ======================
 * GLOBAL MIDDLEWARE
 * ======================
 */
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
/**
 * ======================
 * SWAGGER
 * ======================
 */
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
/**
 * ======================
 * PUBLIC ROUTES
 * ======================
 */
app.use("/api/auth", auth_1.default);
app.use("/api/health", health_1.default);
/**
 * ======================
 * ROLE-BASED ROUTERS
 * ======================
 */
// REGISTRATION
const registrationRouter = express_1.default.Router();
registrationRouter.use(authJWT_1.authJWT, (0, requireRole_1.requireRole)(["registration"]));
registrationRouter.use("/patients", patients_1.default);
registrationRouter.use("/queues", queues_1.default);
app.use("/api/registration", registrationRouter);
// NURSE
const nurseRouter = express_1.default.Router();
nurseRouter.use(authJWT_1.authJWT, (0, requireRole_1.requireRole)(["nurse"]));
nurseRouter.use("/queues", queues_1.default);
nurseRouter.use("/records", records_1.default);
app.use("/api/nurse", nurseRouter);
// DOCTOR
const doctorRouter = express_1.default.Router();
doctorRouter.use(authJWT_1.authJWT, (0, requireRole_1.requireRole)(["doctor"]));
doctorRouter.use("/queues", queues_1.default);
doctorRouter.use("/records", records_1.default);
app.use("/api/doctor", doctorRouter);
// ADMIN
const adminRouter = express_1.default.Router();
adminRouter.use(authJWT_1.authJWT, (0, requireRole_1.requireRole)(["admin"]));
adminRouter.use("/auditLogs", auditLogs_1.default);
adminRouter.use("/authLogs", authLogs_1.default);
adminRouter.use("/users", user_1.default);
app.use("/api/admin", adminRouter);
/**
 * ======================
 * ERROR HANDLER (LAST)
 * ======================
 */
app.use(errorHandler_1.errorHandler);
/**
 * ======================
 * SERVER START
 * ======================
 */
app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log(`📘 Swagger docs on http://localhost:${PORT}/api/docs`);
});
