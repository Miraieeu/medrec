require("dotenv").config();
import { ethers } from "ethers";
import path from "path";
import { fileURLToPath } from "url";

// Load ABI
import ABI from "../../blockchain/AuditLedger.abi.json";

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
  process.env.BLOCKCHAIN_PRIVATE_KEY!,
  provider
);

const contract = new ethers.Contract(
  process.env.AUDIT_CONTRACT_ADDRESS!,
  ABI,
  wallet
);

export async function commitAuditToBlockchain(auditHash: string): Promise<string> {
 // if (!auditHash || auditHash.length !== 64) {
  //  throw new Error("auditHash must be 64 hex chars");
//  }

  const tx = await contract.commitAudit(`0x${auditHash}`);
  await tx.wait();
  return tx.hash;
}
