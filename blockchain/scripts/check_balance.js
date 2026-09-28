const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const network = await ethers.provider.getNetwork();
  
  console.log("Network Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer Address:", deployer.address);
  console.log("POL Balance:", ethers.formatEther(balance), "POL");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
