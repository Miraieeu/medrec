"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAuditToBlockchain = commitAuditToBlockchain;
require("dotenv").config();
const ethers_1 = require("ethers");
// Load ABI
const AuditLedger_abi_json_1 = __importDefault(require("../../blockchain/AuditLedger.abi.json"));
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers_1.ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
const contract = new ethers_1.ethers.Contract(process.env.AUDIT_CONTRACT_ADDRESS, AuditLedger_abi_json_1.default, wallet);
async function commitAuditToBlockchain(auditHash) {
    // if (!auditHash || auditHash.length !== 64) {
    //  throw new Error("auditHash must be 64 hex chars");
    //  }
    const tx = await contract.commitAudit(`0x${auditHash}`);
    await tx.wait();
    return tx.hash;
}
