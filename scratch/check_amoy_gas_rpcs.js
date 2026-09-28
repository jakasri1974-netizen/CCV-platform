const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPCS = [
  "https://rpc-amoy.polygon.technology/",
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.gateway.tenderly.co",
  "https://80002.rpc.thirdweb.com"
];

async function main() {
  const pk = process.env.PRIVATE_KEY;
  for (const rpc of RPCS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(pk, provider);
      const balance = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      console.log(`RPC: ${rpc}`);
      console.log(`  Balance: ${ethers.formatEther(balance)} POL`);
      console.log(`  GasPrice: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A"} gwei`);
      console.log(`  MaxFee: ${feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A"} gwei`);
    } catch (e) {
      console.log(`RPC: ${rpc} Error: ${e.message}`);
    }
  }
}

main();
