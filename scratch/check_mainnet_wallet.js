const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Read .env file safely
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.trim().split('=');
    if (parts.length >= 2 && !parts[0].startsWith('#')) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
}

async function checkWallet() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.log("NO_PRIVATE_KEY_SET");
    return;
  }
  
  try {
    const wallet = new ethers.Wallet(pk);
    console.log("Deployer Address:", wallet.address);

    const rpcUrl = process.env.POLYGON_MAINNET_RPC_URL || 'https://polygon-rpc.com';
    console.log("RPC URL:", rpcUrl);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    console.log("Connected Chain ID:", network.chainId.toString());

    const balanceWei = await provider.getBalance(wallet.address);
    const balancePol = ethers.formatEther(balanceWei);
    console.log("POL Balance:", balancePol, "POL");
  } catch (err) {
    console.error("Wallet check error:", err.message);
  }
}

checkWallet();
