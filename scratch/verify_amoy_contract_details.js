const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const batchAbi = require(path.join(__dirname, "../backend/config/BatchCertificateRegistryAbi.json"));
const credAbi = require(path.join(__dirname, "../backend/config/CredentialVerificationAbi.json"));

const candidates = [
  { name: "Nonce 105", addr: "0xD5ac451B0c50B9476107823Af206eD814a2e2580" },
  { name: "Nonce 104", addr: "0xCace1b78160AE76398F486c8a18044da0d66d86D" },
  { name: "Nonce 103", addr: "0x4b6aB5F819A515382B0dEB6935D793817bB4af28" },
  { name: "Nonce 58",  addr: "0xc351628EB244ec633d5f21fBD6621e1a683B1181" },
  { name: "Nonce 42",  addr: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf" },
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  for (const c of candidates) {
    console.log(`\n=== Checking ${c.name}: ${c.addr} ===`);
    const batchContract = new ethers.Contract(c.addr, batchAbi, provider);

    try {
      const owner = await batchContract.owner();
      console.log(`  Owner: ${owner}`);
    } catch (e) {
      console.log(`  owner() failed: ${e.message}`);
    }

    try {
      const total = await batchContract.totalAnchoredBatches();
      console.log(`  BatchCertificateRegistry -> totalAnchoredBatches: ${total}`);
      const isAuth = await batchContract.authorizedIssuers(signerAddr);
      console.log(`  BatchCertificateRegistry -> authorizedIssuers(${signerAddr}): ${isAuth}`);
      console.log(`  🎉 CONFIRMED BATCHCERTIFICATEREGISTRY CONTRACT AT ${c.addr}!`);
    } catch (e) {
      console.log(`  BatchCertificateRegistry check failed: ${e.message}`);
    }

    const credContract = new ethers.Contract(c.addr, credAbi, provider);
    try {
      const issueCount = await credContract.totalIssuedCertificates();
      console.log(`  CredentialVerification -> totalIssuedCertificates: ${issueCount}`);
      console.log(`  🎉 CONFIRMED CREDENTIALVERIFICATION CONTRACT AT ${c.addr}!`);
    } catch (e) {
      console.log(`  CredentialVerification check failed: ${e.message}`);
    }
  }
}

main().catch(console.error);
