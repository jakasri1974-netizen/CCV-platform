const { getContractInstance, getProvider } = require("../config/network");
const { ethers } = require("ethers");

/**
 * Read batch Merkle Root state directly from smart contract on-chain
 * @param {string} batchId
 * @param {string} candidateMerkleRoot
 */
async function verifyBatchOnChain(batchId, candidateMerkleRoot) {
  try {
    const contract = getContractInstance();
    if (!contract) {
      return {
        onChainExists: false,
        onChainValid: false,
        rootMatches: false,
        error: "Smart contract instance not configured",
      };
    }

    const isAnchored = await contract.isBatchAnchored(batchId);
    if (!isAnchored) {
      return {
        onChainExists: false,
        onChainValid: false,
        rootMatches: false,
      };
    }

    const onChainRoot = await contract.getMerkleRoot(batchId);
    let formattedCandidate = candidateMerkleRoot;
    if (!formattedCandidate.startsWith("0x")) formattedCandidate = "0x" + formattedCandidate;

    const rootMatches = (onChainRoot.toLowerCase() === formattedCandidate.toLowerCase());

    const batchDetails = await contract.getBatch(batchId);

    return {
      onChainExists: true,
      onChainValid: batchDetails.valid,
      onChainMerkleRoot: onChainRoot,
      rootMatches,
      issuer: batchDetails.issuer,
      anchoredAt: new Date(Number(batchDetails.anchoredAt) * 1000).toISOString(),
      totalCertificates: Number(batchDetails.totalCertificatesCount),
    };
  } catch (err) {
    console.warn("Blockchain Service Batch Verification Warning:", err.message);
    return {
      onChainExists: false,
      onChainValid: false,
      rootMatches: false,
      error: err.message,
    };
  }
}

/**
 * Read certificate verification state from smart contract on-chain
 * @param {string} certificateId
 * @param {string} candidateHashHex
 */
async function verifyOnChain(certificateId, candidateHashHex) {
  try {
    const contract = getContractInstance();
    if (!contract) {
      return {
        onChainExists: false,
        onChainValid: false,
        hashMatches: false,
        issuer: null,
        issuedAt: null,
        error: "Smart contract instance not configured",
      };
    }

    const exists = await contract.certificateExists(certificateId);
    if (!exists) {
      return {
        onChainExists: false,
        onChainValid: false,
        hashMatches: false,
        issuer: null,
        issuedAt: null,
      };
    }

    let formattedHash = candidateHashHex;
    if (!formattedHash.startsWith("0x")) {
      formattedHash = "0x" + formattedHash;
    }

    const [isValid, isHashMatching, issuerAddress, issuedAtBigInt] = await contract.verifyCertificate(
      certificateId,
      formattedHash
    );

    return {
      onChainExists: true,
      onChainValid: isValid,
      hashMatches: isHashMatching,
      issuer: issuerAddress,
      issuedAt: new Date(Number(issuedAtBigInt) * 1000).toISOString(),
    };
  } catch (err) {
    console.warn("Blockchain Service Certificate Verification Warning:", err.message);
    return {
      onChainExists: false,
      onChainValid: false,
      hashMatches: false,
      error: err.message,
    };
  }
}

/**
 * Fetch contract info and system stats from on-chain RPC node
 */
async function getOnChainStats() {
  try {
    const provider = getProvider();
    const contract = getContractInstance();

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    let totalOnChainCertificates = 0;
    let totalOnChainBatches = 0;
    let contractOwner = "N/A";
    let contractAddress = "N/A";

    if (contract) {
      contractAddress = await contract.getAddress();
      contractOwner = await contract.owner();
      totalOnChainCertificates = Number(await contract.totalCertificates());
      totalOnChainBatches = Number(await contract.totalBatches());
    }

    return {
      networkName: network.name === "unknown" ? "Hardhat / Local" : network.name,
      chainId: Number(network.chainId),
      blockNumber,
      contractAddress,
      contractOwner,
      totalOnChainCertificates,
      totalOnChainBatches,
    };
  } catch (err) {
    console.warn("Could not fetch on-chain node stats:", err.message);
    return {
      networkName: "Hardhat / Local",
      chainId: process.env.CHAIN_ID || 31337,
      blockNumber: 0,
      contractAddress: process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      totalOnChainCertificates: 0,
      totalOnChainBatches: 0,
      error: err.message,
    };
  }
}

/**
 * Anchor Merkle Root on Polygon / Hardhat using backend signer wallet (No MetaMask required!)
 * @param {string} recordOrBatchId 
 * @param {string} merkleRootHex 
 * @param {number} totalCount 
 */
async function anchorMerkleRootOnChain(recordOrBatchId, merkleRootHex, totalCount = 1) {
  try {
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.warn("⚠️ Backend private key not set. Skipping on-chain anchoring.");
      return { success: false, message: "No private key configured on backend" };
    }

    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = getContractInstance(wallet);

    if (!contract) {
      return { success: false, message: "Smart contract instance unavailable" };
    }

    let formattedRoot = merkleRootHex;
    if (!formattedRoot.startsWith("0x")) formattedRoot = "0x" + formattedRoot;

    console.log(`🔗 Anchoring Merkle Root for ${recordOrBatchId} on-chain...`);
    const tx = await contract.anchorBatch(recordOrBatchId, formattedRoot, totalCount);
    const receipt = await tx.wait();

    console.log(`✅ On-Chain Anchored! Tx: ${receipt.hash}, Block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      issuerAddress: wallet.address,
    };
  } catch (err) {
    console.warn("⚠️ Backend Merkle Root Anchoring Warning:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  verifyBatchOnChain,
  verifyOnChain,
  getOnChainStats,
  anchorMerkleRootOnChain,
};

