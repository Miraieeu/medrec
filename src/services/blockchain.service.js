require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");

// Load ABI hasil deploy
const ABI = require(path.join(
  __dirname,
  "../../blockchain/AuditLedger.abi.json"
));

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
  process.env.BLOCKCHAIN_PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.AUDIT_CONTRACT_ADDRESS,
  ABI,
  wallet
);

async function commitAuditToBlockchain(auditHash) {
  if (!auditHash || auditHash.length !== 64) {
    throw new Error("auditHash must be 64 hex chars");
  }

  const tx = await contract.commitAudit(`0x${auditHash}`);
  const receipt = await tx.wait();
  return receipt.hash;
}

module.exports = { commitAuditToBlockchain };
