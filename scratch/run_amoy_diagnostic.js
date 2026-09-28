const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../.env") });

const PRIMARY_RPC = "https://rpc-amoy.polygon.technology/";
const FALLBACK_RPCS = [
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://80002.rpc.thirdweb.com",
  "https://polygon-amoy.gateway.tenderly.co"
];

const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;

function createProvider(url, timeoutMs = 15000) {
  const req = new ethers.FetchRequest(url);
  req.timeout = timeoutMs;
  return new ethers.JsonRpcProvider(req, { name: "polygon-amoy", chainId: 80002 }, { staticNetwork: true });
}

async function withRetry(fn, retries = 3, delayMs = 1500) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastErr;
}

async function runDiagnostic() {
  console.log("=========================================================================");
  console.log("🔍 POLYGON AMOY RPC RELIABILITY DIAGNOSTIC");
  console.log("=========================================================================\n");

  const rpcList = [PRIMARY_RPC, ...FALLBACK_RPCS];
  let activeProvider = null;
  let activeRpcUrl = null;
  let connectionTimeMs = 0;

  for (const rpcUrl of rpcList) {
    console.log(`📡 Connecting to RPC: ${rpcUrl}...`);
    const start = Date.now();
    try {
      const p = createProvider(rpcUrl, 15000);
      const chainIdHex = await withRetry(() => p.send("eth_chainId", []), 2, 1000);
      const chainId = parseInt(chainIdHex, 16);
      if (chainId === 80002) {
        connectionTimeMs = Date.now() - start;
        activeProvider = p;
        activeRpcUrl = rpcUrl;
        console.log(`   ✅ Connected! Response time: ${connectionTimeMs}ms (Chain ID: ${chainId})\n`);
        break;
      }
    } catch (err) {
      console.log(`   ⚠️ Failed to connect: ${err.message.split("\n")[0]}`);
    }
  }

  if (!activeProvider) {
    console.error("❌ ERROR: Unable to connect to any Polygon Amoy RPC endpoint!");
    process.exit(1);
  }

  // 1. eth_chainId check
  console.log("1️⃣ [eth_chainId Check]");
  const chainIdHex = await withRetry(() => activeProvider.send("eth_chainId", []));
  const chainIdDec = parseInt(chainIdHex, 16);
  const network = await withRetry(() => activeProvider.getNetwork());
  console.log(`   - Hex Chain ID: ${chainIdHex}`);
  console.log(`   - Dec Chain ID: ${chainIdDec}`);
  console.log(`   - Ethers Network Name: ${network.name}`);
  console.log(`   - Chain ID Verified: ${chainIdDec === 80002 ? "✅ MATCHES 80002" : "❌ MISMATCH"}`);

  // 2. Deployer Address & Balance (getBalance)
  console.log("\n2️⃣ [Deployer Address & getBalance Check]");
  if (!PRIVATE_KEY) {
    console.error("   ❌ ERROR: Private key is not set in environment!");
    process.exit(1);
  }
  const wallet = new ethers.Wallet(PRIVATE_KEY, activeProvider);
  console.log(`   - Deployer Address: ${wallet.address}`);
  
  const balanceRaw = await withRetry(() => activeProvider.getBalance(wallet.address));
  const balancePol = ethers.formatEther(balanceRaw);
  console.log(`   - Amoy POL Balance: ${balancePol} POL (${balanceRaw.toString()} wei)`);

  // 3. getCode for configured contract address
  console.log("\n3️⃣ [getCode Check for Configured Contract]");
  let configuredAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const configPath = path.join(__dirname, "../backend/config/contractAddress.json");
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (cfg.batchRegistryAddress) configuredAddress = cfg.batchRegistryAddress;
      else if (cfg.address) configuredAddress = cfg.address;
    } catch (e) {}
  }
  console.log(`   - Configured Contract Address: ${configuredAddress}`);
  const code = await withRetry(() => activeProvider.getCode(configuredAddress));
  console.log(`   - Bytecode Length: ${code.length}`);
  console.log(`   - Has Deployed Code: ${code !== "0x" ? "✅ YES (Contract deployed)" : "ℹ️ NO (0x - Empty / Local default)"}`);

  // 4. gas/fee data check
  console.log("\n4️⃣ [Gas / Fee Data Check]");
  const feeData = await withRetry(() => activeProvider.getFeeData());
  const gasPriceGwei = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A";
  const maxFeeGwei = feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A";
  const maxPriorityGwei = feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "N/A";
  
  console.log(`   - Base Gas Price:        ${gasPriceGwei} gwei`);
  console.log(`   - Max Fee Per Gas:       ${maxFeeGwei} gwei`);
  console.log(`   - Max Priority Fee:     ${maxPriorityGwei} gwei`);

  // 5. RPC Reliability & Ping Test (5 consecutive requests)
  console.log("\n5️⃣ [RPC Reliability Stress / Latency Test]");
  const pings = 5;
  let successCount = 0;
  const latencies = [];

  for (let i = 1; i <= pings; i++) {
    const t0 = Date.now();
    try {
      await withRetry(() => activeProvider.getBlockNumber(), 1, 500);
      const elapsed = Date.now() - t0;
      latencies.push(elapsed);
      successCount++;
      console.log(`   - Call ${i}/${pings}: Success in ${elapsed}ms`);
    } catch (err) {
      console.log(`   - Call ${i}/${pings}: Failed (${err.message.split("\n")[0]})`);
    }
  }

  const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : "N/A";
  const isReliable = successCount === pings;

  console.log(`\n📊 Reliability Summary: ${successCount}/${pings} calls succeeded. Average latency: ${avgLatency}ms.`);
  console.log(`   RPC Reliability Status: ${isReliable ? "✅ HIGHLY RELIABLE" : "⚠️ UNSTABLE"}`);

  console.log("\n=========================================================================");
  console.log("📋 FINAL DIAGNOSTIC SUMMARY");
  console.log("=========================================================================");
  console.log(`• RPC Endpoint:       ${activeRpcUrl}`);
  console.log(`• RPC Connectivity:   Connected (${connectionTimeMs}ms)`);
  console.log(`• Chain ID:           ${chainIdDec} (80002)`);
  console.log(`• Deployer Address:   ${wallet.address}`);
  console.log(`• Amoy POL Balance:   ${balancePol} POL`);
  console.log(`• Gas Price:          ${gasPriceGwei} gwei (Max Fee: ${maxFeeGwei} gwei)`);
  console.log(`• RPC Reliability:    ${isReliable ? "Responding Reliably" : "Intermittent/Unstable"}`);
  console.log("=========================================================================");
  console.log("⏸️  Automatic deployment halted per instructions. Diagnostic complete.");
}

runDiagnostic().catch((err) => {
  console.error("❌ Diagnostic Failed:", err);
  process.exit(1);
});
