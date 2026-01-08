require("dotenv").config();

const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { ethers } = require("ethers");

// ===== 1. Compile =====
const contractPath = path.join(__dirname, "AuditLedger.sol");
const source = fs.readFileSync(contractPath, "utf8");
console.log("DEBUG PK =", process.env.BLOCKCHAIN_PRIVATE_KEY);
console.log("DEBUG PK LENGTH =", process.env.BLOCKCHAIN_PRIVATE_KEY?.length);
const input = {
  language: "Solidity",
  sources: {
    "AuditLedger.sol": { content: source },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const err of output.errors) {
    console.error(err.formattedMessage);
  }
  process.exit(1);
}

const contract = output.contracts["AuditLedger.sol"]["AuditLedger"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// ===== 2. Deploy =====
(async () => {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
  );

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployed = await factory.deploy();

  await deployed.waitForDeployment();

  console.log("✅ AuditLedger deployed at:", await deployed.getAddress());

  // ===== 3. Save ABI for backend =====
  fs.writeFileSync(
    path.join(__dirname, "AuditLedger.abi.json"),
    JSON.stringify(abi, null, 2)
  );
})();
