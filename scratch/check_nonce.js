const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  console.log("Checking address:", signerAddr);
  const nonce = await provider.getTransactionCount(signerAddr);
  console.log("Transaction Count (Nonce):", nonce);

  for (let i = 0; i < nonce; i++) {
    const calcAddr = ethers.getCreateAddress({ from: signerAddr, nonce: i });
    const code = await provider.getCode(calcAddr);
    console.log(`Nonce ${i} calculated contract address: ${calcAddr} | code length: ${code.length}`);
    if (code !== "0x") {
      console.log(`🎯 FOUND DEPLOYED CONTRACT AT NONCE ${i}: ${calcAddr}`);
    }
  }
}

main().catch(console.error);
