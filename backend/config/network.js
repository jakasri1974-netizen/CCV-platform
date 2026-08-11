const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function getContractMetadata() {
  const addressPath = path.join(__dirname, "contractAddress.json");
  const abiPath = path.join(__dirname, "CredentialVerificationAbi.json");

  let address = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  let abi = [];

  if (fs.existsSync(addressPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(addressPath, "utf8"));
      if (data.address) address = data.address;
    } catch (e) {
      console.warn("Could not parse contractAddress.json, using fallback.");
    }
  }

  if (fs.existsSync(abiPath)) {
    try {
      abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse CredentialVerificationAbi.json.");
    }
  }

  return { address, abi };
}

function getProvider() {
  const rpcUrl = process.env.POLYGON_RPC_URL || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getContractInstance() {
  const { address, abi } = getContractMetadata();
  if (!address || !abi || abi.length === 0) {
    return null;
  }
  const provider = getProvider();
  return new ethers.Contract(address, abi, provider);
}

module.exports = {
  getContractMetadata,
  getProvider,
  getContractInstance,
};
