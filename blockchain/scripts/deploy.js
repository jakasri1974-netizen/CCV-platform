const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying CredentialVerification contract...");
  console.log("Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH/POL");
  console.log("----------------------------------------------------");

  const CredentialVerification = await ethers.getContractFactory("CredentialVerification");
  const contract = await CredentialVerification.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ CredentialVerification deployed to:", contractAddress);

  // Contract Metadata JSON
  const contractInfo = {
    address: contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString()
  };

  // Get Artifact ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/CredentialVerification.sol/CredentialVerification.json");
  let artifact = {};
  if (fs.existsSync(artifactPath)) {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  // Paths to export metadata & ABI
  const backendConfigDir = path.join(__dirname, "../../backend/config");
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");

  if (!fs.existsSync(backendConfigDir)) fs.mkdirSync(backendConfigDir, { recursive: true });
  if (!fs.existsSync(frontendContractsDir)) fs.mkdirSync(frontendContractsDir, { recursive: true });

  fs.writeFileSync(
    path.join(backendConfigDir, "contractAddress.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  fs.writeFileSync(
    path.join(backendConfigDir, "CredentialVerificationAbi.json"),
    JSON.stringify(artifact.abi || [], null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "contractAddress.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "CredentialVerificationAbi.json"),
    JSON.stringify(artifact.abi || [], null, 2)
  );

  console.log("✅ Exported Contract Address & ABI to backend & frontend successfully.");
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment Error:", error);
    process.exit(1);
  });
