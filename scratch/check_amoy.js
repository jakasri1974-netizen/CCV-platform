const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const TX_HASH = "0xd36b2a7fc1ab195f43f5b1e9484be0769f9b35aeb3f8fee33baaf5cb185f4532";
const CURRENT_CONFIG_ADDR = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  console.log("Connecting to RPC:", RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  console.log("\n--- 1. RPC Connection & Network Check ---");
  const network = await provider.getNetwork();
  console.log("Connected Network Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  console.log("\n--- 2. Checking Current Config Contract Address ---");
  console.log("Target Address:", CURRENT_CONFIG_ADDR);
  const code = await provider.getCode(CURRENT_CONFIG_ADDR);
  console.log("eth_getCode result length:", code.length);
  console.log("eth_getCode is 0x (empty):", code === "0x");

  console.log("\n--- 3. Verifying Existing Transaction ---");
  console.log("Tx Hash:", TX_HASH);
  const tx = await provider.getTransaction(TX_HASH);
  if (!tx) {
    console.log("Transaction NOT FOUND on Amoy via RPC!");
  } else {
    console.log("Tx Details:");
    console.log("  From:", tx.from);
    console.log("  To:", tx.to);
    console.log("  Block Number:", tx.blockNumber);
    console.log("  Chain ID:", tx.chainId ? tx.chainId.toString() : "N/A");
    console.log("  Value:", tx.value.toString());
    console.log("  Data:", tx.data);

    const receipt = await provider.getTransactionReceipt(TX_HASH);
    if (receipt) {
      console.log("\nTx Receipt:");
      console.log("  Status:", receipt.status === 1 ? "1 (SUCCESS)" : `0 (FAILED: ${receipt.status})`);
      console.log("  Block Number:", receipt.blockNumber);
      console.log("  Gas Used:", receipt.gasUsed.toString());
      console.log("  Contract Address (if deployment):", receipt.contractAddress);
      console.log("  Logs Count:", receipt.logs.length);
      receipt.logs.forEach((log, i) => {
        console.log(`  Log ${i}:`);
        console.log("    Address:", log.address);
        console.log("    Topics:", log.topics);
        console.log("    Data:", log.data);
      });

      if (tx.to) {
        const targetCode = await provider.getCode(tx.to);
        console.log(`\nCode at Tx 'to' address (${tx.to}): length = ${targetCode.length}, exists = ${targetCode !== "0x"}`);
      }
    } else {
      console.log("Receipt NOT FOUND!");
    }
  }

  const privKey = process.env.PRIVATE_KEY;
  if (privKey) {
    const wallet = new ethers.Wallet(privKey, provider);
    console.log("\n--- 4. Backend Signer Info ---");
    console.log("Signer Address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Signer Balance:", ethers.formatEther(balance), "POL");
  }
}

main().catch(console.error);
