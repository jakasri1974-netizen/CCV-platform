const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("====================================================");
  console.log("🚀 DEPLOYING BLOCKCERT SOLIDITY SMART CONTRACTS");
  console.log("Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH/POL");
  console.log("====================================================");

  // 1. Deploy BatchCertificateRegistry
  const BatchCertificateRegistry = await ethers.getContractFactory("BatchCertificateRegistry");
  const batchContract = await BatchCertificateRegistry.deploy();
  await batchContract.waitForDeployment();
  const batchAddress = await batchContract.getAddress();
  console.log("✅ BatchCertificateRegistry deployed to:", batchAddress);

  // 2. Deploy CredentialVerification (Backward compatibility)
  const CredentialVerification = await ethers.getContractFactory("CredentialVerification");
  const credContract = await CredentialVerification.deploy();
  await credContract.waitForDeployment();
  const credAddress = await credContract.getAddress();
  console.log("✅ CredentialVerification deployed to:", credAddress);

  const networkInfo = await ethers.provider.getNetwork();

  const contractInfo = {
    address: batchAddress,
    batchRegistryAddress: batchAddress,
    credentialVerificationAddress: credAddress,
    deployer: deployer.address,
    network: networkInfo.name,
    chainId: Number(networkInfo.chainId),
    deployedAt: new Date().toISOString(),
  };

  // Get Artifact ABIs
  const batchArtifactPath = path.join(__dirname, "../artifacts/contracts/BatchCertificateRegistry.sol/BatchCertificateRegistry.json");
  const credArtifactPath = path.join(__dirname, "../artifacts/contracts/CredentialVerification.sol/CredentialVerification.json");

  let batchArtifact = {};
  let credArtifact = {};
  if (fs.existsSync(batchArtifactPath)) batchArtifact = JSON.parse(fs.readFileSync(batchArtifactPath, "utf8"));
  if (fs.existsSync(credArtifactPath)) credArtifact = JSON.parse(fs.readFileSync(credArtifactPath, "utf8"));

  // Export metadata & ABIs to backend and frontend
  const backendConfigDir = path.join(__dirname, "../../backend/config");
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");

  if (!fs.existsSync(backendConfigDir)) fs.mkdirSync(backendConfigDir, { recursive: true });
  if (!fs.existsSync(frontendContractsDir)) fs.mkdirSync(frontendContractsDir, { recursive: true });

  fs.writeFileSync(
    path.join(backendConfigDir, "contractAddress.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  fs.writeFileSync(
    path.join(backendConfigDir, "BatchCertificateRegistryAbi.json"),
    JSON.stringify(batchArtifact.abi || [], null, 2)
  );
  fs.writeFileSync(
    path.join(backendConfigDir, "CredentialVerificationAbi.json"),
    JSON.stringify(credArtifact.abi || [], null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "contractAddress.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "BatchCertificateRegistryAbi.json"),
    JSON.stringify(batchArtifact.abi || [], null, 2)
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "CredentialVerificationAbi.json"),
    JSON.stringify(credArtifact.abi || [], null, 2)
  );

  console.log("====================================================");
  console.log("🎉 Exported Smart Contract Addresses & ABIs successfully!");
  console.log(`Contract Address: ${batchAddress}`);
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment Error:", error);
    process.exit(1);
  });
