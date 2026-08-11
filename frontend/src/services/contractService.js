import { ethers } from 'ethers';
import contractAddressData from '../contracts/contractAddress.json';
import abiData from '../contracts/CredentialVerificationAbi.json';

export const CONTRACT_ADDRESS = contractAddressData.address || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = abiData;

export function getContractInstance(runner) {
  if (!CONTRACT_ADDRESS || !CONTRACT_ABI || CONTRACT_ABI.length === 0) {
    throw new Error("Smart contract ABI or address missing. Ensure contracts are compiled & deployed.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

/**
 * Anchor a Merkle Root batch on Polygon smart contract (1 Tx for 8,000+ certificates)
 */
export async function anchorBatchOnChain(signer, batchId, merkleRootHex, totalCertificates) {
  const contract = getContractInstance(signer);

  let formattedRoot = merkleRootHex;
  if (!formattedRoot.startsWith('0x')) {
    formattedRoot = '0x' + formattedRoot;
  }

  console.log(`Sending registerBatch Tx for Batch '${batchId}' with Merkle Root: ${formattedRoot}...`);
  const tx = await contract.registerBatch(batchId, formattedRoot, totalCertificates);
  console.log("Batch transaction submitted:", tx.hash);

  const receipt = await tx.wait(1);
  console.log("Batch transaction confirmed in block:", receipt.blockNumber);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    issuerAddress: await signer.getAddress(),
  };
}

/**
 * Single certificate issuance on-chain (Backward compatible)
 */
export async function issueCertificateOnChain(signer, certificateId, certificateHashHex) {
  const contract = getContractInstance(signer);
  
  let formattedHash = certificateHashHex;
  if (!formattedHash.startsWith('0x')) {
    formattedHash = '0x' + formattedHash;
  }

  console.log(`Sending issueCertificate Tx to contract ${CONTRACT_ADDRESS} for ID: ${certificateId}...`);
  const tx = await contract.issueCertificate(certificateId, formattedHash);
  console.log("Transaction submitted:", tx.hash);
  
  const receipt = await tx.wait(1);
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    issuerAddress: await signer.getAddress(),
  };
}

export async function revokeCertificateOnChain(signer, certificateId) {
  const contract = getContractInstance(signer);
  console.log(`Sending revokeCertificate Tx for ID: ${certificateId}...`);
  const tx = await contract.revokeCertificate(certificateId);
  const receipt = await tx.wait(1);
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function verifyCertificateOnChain(provider, certificateId, candidateHashHex) {
  try {
    const contract = getContractInstance(provider);
    let formattedHash = candidateHashHex;
    if (!formattedHash.startsWith('0x')) {
      formattedHash = '0x' + formattedHash;
    }

    const exists = await contract.certificateExists(certificateId);
    if (!exists) {
      return { exists: false, valid: false, hashMatches: false };
    }

    const [isValid, isHashMatching, issuer, issuedAt] = await contract.verifyCertificate(certificateId, formattedHash);
    return {
      exists: true,
      valid: isValid,
      hashMatches: isHashMatching,
      issuer,
      issuedAt: new Date(Number(issuedAt) * 1000).toISOString(),
    };
  } catch (err) {
    console.error("Browser Web3 verify error:", err);
    return { exists: false, valid: false, hashMatches: false, error: err.message };
  }
}
