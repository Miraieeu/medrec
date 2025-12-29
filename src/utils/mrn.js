"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMRN = generateMRN;
function generateMRN(counter) {
    return `MR-${counter.toString().padStart(6, "0")}`;
}
