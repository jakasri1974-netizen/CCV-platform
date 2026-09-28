const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPCS = [
  process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/",
  "https://rpc-amoy.polygon.technology/",
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://80002.rpc.thirdweb.com",
  "https://polygon-amoy.gateway.tenderly.co"
];

const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;
const HARDHAT_LOCAL_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function createProvider(url, timeoutMs = 20000) {
  const req = new ethers.FetchRequest(url);
  req.timeout = timeoutMs;
  return new ethers.JsonRpcProvider(req, { name: "polygon-amoy", chainId: 80002 }, { staticNetwork: true });
}

async function withRetry(fn, retries = 3, delayMs = 2000) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        console.log(`    ⚠️ Call failed (attempt ${attempt}/${retries}): ${err.message.split('\n')[0]}. Retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastErr;
}

async function main() {
  console.log("=========================================================================");
  console.log("🚀 BLOCKCERT — POLYGON AMOY DEPLOYMENT & VERIFICATION");
  console.log("=========================================================================\n");

  let provider = null;
  let activeRpc = null;

  for (const rpcUrl of RPCS) {
    console.log(`[1] Connecting to RPC: ${rpcUrl}...`);
    try {
      const p = createProvider(rpcUrl, 20000);
      const chainIdHex = await withRetry(() => p.send("eth_chainId", []), 2, 1000);
      const chainIdDec = parseInt(chainIdHex, 16);
      if (chainIdDec === 80002) {
        provider = p;
        activeRpc = rpcUrl;
        console.log(`    ✅ Connected successfully to Chain ID: ${chainIdDec} (${chainIdHex})\n`);
        break;
      }
    } catch (e) {
      console.log(`    ⚠️ Could not connect to ${rpcUrl}: ${e.message.split("\n")[0]}`);
    }
  }

  if (!provider) {
    console.error("❌ ERROR: All Polygon Amoy RPC endpoints failed to respond!");
    process.exit(1);
  }

  // 1. Confirm chainId = 80002
  console.log("[CHECK 1] Confirming Chain ID...");
  const chainIdHex = await withRetry(() => provider.send("eth_chainId", []));
  const chainId = parseInt(chainIdHex, 16);
  console.log(`    Chain ID: ${chainId} (${chainId === 80002 ? "✅ MATCHES 80002" : "❌ MISMATCH"})`);
  if (chainId !== 80002) {
    console.error("❌ ERROR: Chain ID is not 80002!");
    process.exit(1);
  }

  // 2. Confirm deployer address
  if (!PRIVATE_KEY) {
    console.error("❌ ERROR: Private key is missing in environment!");
    process.exit(1);
  }
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("\n[CHECK 2] Confirming Deployer Address...");
  console.log(`    Deployer Address: ${wallet.address}`);

  // 3 & 4. Query & confirm balance (~0.100324 POL)
  console.log("\n[CHECK 3 & 4] Querying Current Amoy POL Balance from Active RPC...");
  const balanceRaw = await withRetry(() => provider.getBalance(wallet.address));
  const balancePol = ethers.formatEther(balanceRaw);
  console.log(`    Deployer Balance: ${balancePol} POL (${balanceRaw.toString()} wei)`);
  const isApproxBalance = parseFloat(balancePol) >= 0.09 && parseFloat(balancePol) <= 0.15;
  console.log(`    Balance Check (~0.100324 POL): ${isApproxBalance ? "✅ CONFIRMED" : "⚠️ UNEXPECTED VALUE"}`);

  // 5. Fetch current gas/fee data
  console.log("\n[CHECK 5] Fetching Gas & Fee Data...");
  const block = await withRetry(() => provider.getBlock("latest"));
  const baseFee = block.baseFeePerGas || 63n;
  const maxPriorityFeePerGas = ethers.parseUnits("30", "gwei"); // Standard Polygon Amoy priority fee
  const maxFeePerGas = (baseFee * 2n) + maxPriorityFeePerGas;  // Max fee with EIP-1559 headroom

  console.log(`    Block Base Fee:       ${ethers.formatUnits(baseFee, "gwei")} gwei`);
  console.log(`    Max Priority Fee:     ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} gwei`);
  console.log(`    Max Fee Per Gas:      ${ethers.formatUnits(maxFeePerGas, "gwei")} gwei`);

  // 6. Estimate BatchCertificateRegistry deployment gas and total POL cost
  console.log("\n[CHECK 6] Estimating Deployment Gas and Total POL Cost...");
  const batchArtifact = require(path.join(__dirname, "../blockchain/artifacts/contracts/BatchCertificateRegistry.sol/BatchCertificateRegistry.json"));
  const factory = new ethers.ContractFactory(batchArtifact.abi, batchArtifact.bytecode, wallet);

  let estimatedGas = 678226n;
  try {
    const deployTx = await factory.getDeployTransaction();
    estimatedGas = await withRetry(() => provider.estimateGas(deployTx));
  } catch (err) {
    console.log(`    (Using baseline deployment gas estimate: ${estimatedGas.toString()})`);
  }

  const estimatedCost = estimatedGas * maxFeePerGas;
  const estimatedCostPol = ethers.formatEther(estimatedCost);
  console.log(`    Estimated Gas Units:  ${estimatedGas.toString()}`);
  console.log(`    Estimated Max Cost:   ${estimatedCostPol} POL`);

  // 7. Confirm sufficient balance
  console.log("\n[CHECK 7] Verifying Balance Sufficiency...");
  if (balanceRaw < estimatedCost) {
    console.error(`❌ INSUFFICIENT POL BALANCE: Available ${balancePol} POL < Required ${estimatedCostPol} POL`);
    process.exit(1);
  }
  console.log(`    ✅ Balance check passed! Available ${balancePol} POL >= Required ${estimatedCostPol} POL`);

  // 8. Confirm 0x5FbDB2315678afecb367f032d93F642f64180aa3 has no Amoy bytecode
  console.log("\n[CHECK 8] Inspecting 0x5FbDB2315678afecb367f032d93F642f64180aa3 for Bytecode...");
  const checkCode = await withRetry(() => provider.getCode(HARDHAT_LOCAL_ADDR));
  console.log(`    Address (${HARDHAT_LOCAL_ADDR}) Bytecode Length: ${checkCode.length}`);
  console.log(`    Bytecode Status: ${checkCode === "0x" || checkCode.length <= 2 ? "✅ NO BYTECODE (Unassigned / Hardhat local default)" : "⚠️ CONTAINS CODE"}`);

  // 9. Deploy BatchCertificateRegistry to Polygon Amoy
  console.log("\n=========================================================================");
  console.log("🚀 ALL CHECKS PASSED — DEPLOYING BatchCertificateRegistry TO POLYGON AMOY...");
  console.log("=========================================================================");

  const deployOptions = {
    maxFeePerGas,
    maxPriorityFeePerGas
  };

  const contract = await factory.deploy(deployOptions);
  const txHash = contract.deploymentTransaction().hash;
  console.log(`   Tx Hash Submitted: ${txHash}`);
  console.log(`   Waiting for block confirmation...`);

  // 10. Wait for transaction receipt
  const receipt = await contract.deploymentTransaction().wait(1);
  const contractAddress = await contract.getAddress();

  const actualGasPrice = receipt.gasPrice || receipt.effectiveGasPrice || maxFeePerGas;
  const actualCostWei = receipt.gasUsed * actualGasPrice;
  const actualCostPol = ethers.formatEther(actualCostWei);

  // 11. Verify deployed contract using eth_getCode
  console.log("\n[CHECK 11] Verifying Deployed Bytecode via eth_getCode...");
  const codeAfter = await withRetry(() => provider.getCode(contractAddress));
  const isVerified = codeAfter !== "0x" && codeAfter.length > 2;

  console.log(`   Deployed Contract Address: ${contractAddress}`);
  console.log(`   Bytecode Length:          ${codeAfter.length}`);
  console.log(`   Bytecode Status:          ${isVerified ? "✅ VERIFIED ON-CHAIN (Contract Code Present)" : "❌ EMPTY BYTECODE"}`);

  if (!isVerified) {
    console.error("❌ ERROR: Contract bytecode verification failed post-deployment!");
    process.exit(1);
  }

  // Update backend & frontend configurations
  console.log(`\nUpdating application configuration files...`);
  const contractInfo = {
    address: contractAddress,
    batchRegistryAddress: contractAddress,
    deployer: wallet.address,
    network: "polygon-amoy",
    chainId: 80002,
    deployedAt: new Date().toISOString(),
    deploymentTxHash: txHash,
    blockNumber: receipt.blockNumber,
  };

  const backendConfigDir = path.join(__dirname, "../backend/config");
  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");

  fs.writeFileSync(path.join(backendConfigDir, "contractAddress.json"), JSON.stringify(contractInfo, null, 2));
  fs.writeFileSync(path.join(frontendContractsDir, "contractAddress.json"), JSON.stringify(contractInfo, null, 2));

  fs.writeFileSync(path.join(backendConfigDir, "BatchCertificateRegistryAbi.json"), JSON.stringify(batchArtifact.abi, null, 2));
  fs.writeFileSync(path.join(frontendContractsDir, "BatchCertificateRegistryAbi.json"), JSON.stringify(batchArtifact.abi, null, 2));

  // Update .env CONTRACT_ADDRESS
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
  }

  console.log("✅ Updated backend & frontend contractAddress.json, BatchCertificateRegistryAbi.json, and .env CONTRACT_ADDRESS");

  // 12. Final Output Report
  const scanUrl = `https://amoy.polygonscan.com/tx/${txHash}`;
  console.log("\n=========================================================================");
  console.log("🎉 DEPLOYMENT COMPLETE & VERIFIED ON POLYGON AMOY TESTNET!");
  console.log("=========================================================================");
  console.log(`• Contract Address:                ${contractAddress}`);
  console.log(`• Deployment Transaction Hash:     ${txHash}`);
  console.log(`• Block Number:                    ${receipt.blockNumber}`);
  console.log(`• Gas Used:                        ${receipt.gasUsed.toString()}`);
  console.log(`• Actual Total POL Cost:           ${actualCostPol} POL`);
  console.log(`• PolygonScan Amoy Explorer Link:  ${scanUrl}`);
  console.log("=========================================================================");
}

main().catch((err) => {
  console.error("\n❌ Deployment Failure:", err);
  process.exit(1);
});
