const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function getContractMetadata() {
  const addressPath = path.join(__dirname, "contractAddress.json");
  const batchAbiPath = path.join(__dirname, "BatchCertificateRegistryAbi.json");
  const credAbiPath = path.join(__dirname, "CredentialVerificationAbi.json");

  let address = process.env.CONTRACT_ADDRESS;
  if (!address && fs.existsSync(addressPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(addressPath, "utf8"));
      if (data.batchRegistryAddress) address = data.batchRegistryAddress;
      else if (data.address) address = data.address;
    } catch (e) {
      console.warn("Could not parse contractAddress.json, using fallback.");
    }
  }

  if (!address) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: CONTRACT_ADDRESS is missing in production environment!");
    }
    address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  }

  if (fs.existsSync(batchAbiPath)) {
    try {
      abi = JSON.parse(fs.readFileSync(batchAbiPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse BatchCertificateRegistryAbi.json.");
    }
  }

  if ((!abi || abi.length === 0) && fs.existsSync(credAbiPath)) {
    try {
      abi = JSON.parse(fs.readFileSync(credAbiPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse CredentialVerificationAbi.json.");
    }
  }

  return { address, abi };
}

function getProvider() {
  const primaryRpc = process.env.POLYGON_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com";
  const fallbackRpc = "https://80002.rpc.thirdweb.com";

  try {
    const req = new ethers.FetchRequest(primaryRpc);
    req.timeout = 20000;
    return new ethers.JsonRpcProvider(req, { name: "polygon-amoy", chainId: 80002 }, { staticNetwork: true });
  } catch (e) {
    const reqFallback = new ethers.FetchRequest(fallbackRpc);
    reqFallback.timeout = 20000;
    return new ethers.JsonRpcProvider(reqFallback, { name: "polygon-amoy", chainId: 80002 }, { staticNetwork: true });
  }
}

function getContractInstance(signerOrProvider = null) {
  const { address, abi } = getContractMetadata();
  if (!address || !abi || abi.length === 0) {
    return null;
  }
  const providerOrSigner = signerOrProvider || getProvider();
  return new ethers.Contract(address, abi, providerOrSigner);
}

module.exports = {
  getContractMetadata,
  getProvider,
  getContractInstance,
};
