const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const batchAbi = require(path.join(__dirname, "../backend/config/BatchCertificateRegistryAbi.json"));

const candidates = [
  "0xD5ac451B0c50B9476107823Af206eD814a2e2580",
  "0xCace1b78160AE76398F486c8a18044da0d66d86D",
  "0x4b6aB5F819A515382B0dEB6935D793817bB4af28",
  "0xc351628EB244ec633d5f21fBD6621e1a683B1181",
  "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  for (const addr of candidates) {
    console.log(`\nAddress: ${addr}`);
    const contract = new ethers.Contract(addr, batchAbi, provider);

    try {
      const isAuth = await contract.authorizedIssuers(signerAddr);
      console.log(`  authorizedIssuers(${signerAddr}): ${isAuth}`);
      console.log(`  🎉 BATCHCERTIFICATEREGISTRY VERIFIED AT ${addr}!`);
    } catch (e) {
      console.log(`  authorizedIssuers failed: ${e.message}`);
    }
  }
}

main().catch(console.error);
