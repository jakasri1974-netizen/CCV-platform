const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Check default signer
  const defaultPk = process.env.PRIVATE_KEY;
  if (defaultPk) {
    const wallet = new ethers.Wallet(defaultPk, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log("=== DEFAULT SIGNER WALLET ===");
    console.log("Address:", wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "POL");
  }

  // Check if process.env.BLOCKCHAIN_PRIVATE_KEY exists
  const dedicatedPk = process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (dedicatedPk) {
    const wallet2 = new ethers.Wallet(dedicatedPk, provider);
    const balance2 = await provider.getBalance(wallet2.address);
    console.log("\n=== DEDICATED BLOCKCHAIN SIGNER WALLET ===");
    console.log("Address:", wallet2.address);
    console.log("Balance:", ethers.formatEther(balance2), "POL");
  }

  // Check network fee data
  const feeData = await provider.getFeeData();
  console.log("\n=== AMOY GAS FEE DATA ===");
  console.log("Gas Price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A", "gwei");
  console.log("Max Fee Per Gas:", feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A", "gwei");
  console.log("Max Priority Fee Per Gas:", feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "N/A", "gwei");
}

main().catch(console.error);
