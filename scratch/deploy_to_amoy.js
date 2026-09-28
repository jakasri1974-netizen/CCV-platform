const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPCS = [
  "https://rpc-amoy.polygon.technology/",
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://80002.rpc.thirdweb.com",
  "https://polygon-amoy.gateway.tenderly.co"
];

async function main() {
  const pk = process.env.PRIVATE_KEY;

  for (const rpcUrl of RPCS) {
    console.log(`\n====================================================`);
    console.log(`Trying deployment on RPC: ${rpcUrl}`);
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(pk, provider);
      console.log("Deployer Address:", wallet.address);
      const balance = await provider.getBalance(wallet.address);
      console.log("Deployer Balance:", ethers.formatEther(balance), "POL");

      const feeData = await provider.getFeeData();
      console.log("Gas Price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A", "gwei");

      const batchArtifact = require(path.join(__dirname, "../blockchain/artifacts/contracts/BatchCertificateRegistry.sol/BatchCertificateRegistry.json"));
      const factory = new ethers.ContractFactory(batchArtifact.abi, batchArtifact.bytecode, wallet);

      console.log("Sending deployment transaction for BatchCertificateRegistry...");
      const contract = await factory.deploy({
        maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("35", "gwei"),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("30", "gwei")
      });

      console.log("Deployment Tx Hash:", contract.deploymentTransaction().hash);
      console.log("Waiting for block confirmation...");
      await contract.waitForDeployment();

      const batchAddress = await contract.getAddress();
      console.log("🎉 SUCCESS! BatchCertificateRegistry deployed to:", batchAddress);

      // Save contractAddress.json
      const contractInfo = {
        address: batchAddress,
        batchRegistryAddress: batchAddress,
        deployer: wallet.address,
        network: "polygon-amoy",
        chainId: 80002,
        deployedAt: new Date().toISOString(),
        deploymentTxHash: contract.deploymentTransaction().hash
      };

      const backendConfigDir = path.join(__dirname, "../backend/config");
      const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");

      fs.writeFileSync(path.join(backendConfigDir, "contractAddress.json"), JSON.stringify(contractInfo, null, 2));
      fs.writeFileSync(path.join(frontendContractsDir, "contractAddress.json"), JSON.stringify(contractInfo, null, 2));

      fs.writeFileSync(path.join(backendConfigDir, "BatchCertificateRegistryAbi.json"), JSON.stringify(batchArtifact.abi, null, 2));
      fs.writeFileSync(path.join(frontendContractsDir, "BatchCertificateRegistryAbi.json"), JSON.stringify(batchArtifact.abi, null, 2));

      console.log("Exported contract config and ABIs!");
      return;
    } catch (err) {
      console.log(`❌ Failed on RPC ${rpcUrl}:`, err.message);
    }
  }
}

main().catch(console.error);
