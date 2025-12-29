"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Kumpulin default metrics Node.js
prom_client_1.default.collectDefaultMetrics({
    prefix: "medrec_",
});
exports.register = prom_client_1.default.register;
