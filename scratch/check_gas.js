const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Signer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Signer balance:", ethers.formatEther(balance), "POL");

  const feeData = await provider.getFeeData();
  console.log("Gas Price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A", "gwei");
  console.log("Max Fee Per Gas:", feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "N/A", "gwei");
  console.log("Max Priority Fee Per Gas:", feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "N/A", "gwei");

  const artifact = require(path.join(__dirname, "../blockchain/artifacts/contracts/BatchCertificateRegistry.sol/BatchCertificateRegistry.json"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const deployTx = await factory.getDeployTransaction();
  const estimatedGas = await provider.estimateGas(deployTx);
  console.log("Estimated Gas for deployment:", estimatedGas.toString());

  const gasPriceToUse = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits("30", "gwei");
  const estimatedCost = estimatedGas * gasPriceToUse;
  console.log("Estimated Cost in POL:", ethers.formatEther(estimatedCost));

  if (balance >= estimatedCost) {
    console.log("✅ Balance is SUFFICIENT for deployment!");
  } else {
    console.log("⚠️ Balance might be low, deficit:", ethers.formatEther(estimatedCost - balance));
  }
}

main().catch(console.error);
