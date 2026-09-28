const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const batchAbi = require(path.join(__dirname, "../backend/config/BatchCertificateRegistryAbi.json"));
const credAbi = require(path.join(__dirname, "../backend/config/CredentialVerificationAbi.json"));

const signerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const nonce = await provider.getTransactionCount(signerAddr);
  console.log(`Checking ${nonce} nonces for signer ${signerAddr}...`);

  for (let i = 0; i < nonce; i++) {
    const calcAddr = ethers.getCreateAddress({ from: signerAddr, nonce: i });
    const code = await provider.getCode(calcAddr);
    if (code === "0x") continue;

    console.log(`\nNonce ${i}: Address ${calcAddr} (Bytecode size: ${code.length})`);

    // Test BatchCertificateRegistry
    const batchContract = new ethers.Contract(calcAddr, batchAbi, provider);
    try {
      const owner = await batchContract.owner();
      console.log(`  🎯 MATCH BatchCertificateRegistry! Owner: ${owner}`);
      const isAuth = await batchContract.authorizedIssuers(signerAddr);
      console.log(`     Signer Authorized: ${isAuth}`);
      const total = await batchContract.totalAnchoredBatches();
      console.log(`     Total Batches: ${total}`);
    } catch (e) {
      // Not BatchCertificateRegistry
    }

    // Test CredentialVerification
    const credContract = new ethers.Contract(calcAddr, credAbi, provider);
    try {
      const owner = await credContract.owner();
      console.log(`  🎯 MATCH CredentialVerification! Owner: ${owner}`);
    } catch (e) {
      // Not CredentialVerification
    }
  }
}

main().catch(console.error);
