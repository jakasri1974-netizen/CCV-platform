const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));
const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));

dotenv.config({ path: path.join(__dirname, "../.env") });

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const abi = require(path.join(__dirname, "../backend/config/BatchCertificateRegistryAbi.json"));

const candidateAddresses = [
  "0xD5ac451B0c50B9476107823Af206eD814a2e2580", // Nonce 105
  "0xCace1b78160AE76398F486c8a18044da0d66d86D", // Nonce 104
  "0x4b6aB5F819A515382B0dEB6935D793817bB4af28", // Nonce 103
  "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3", // Nonce 55
  "0x82e01223d51Eb87e16A03E24687EDF0F294da6f1", // Nonce 54
  "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F", // Nonce 26
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Signer address:", signer.address);

  for (const addr of candidateAddresses) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing candidate address: ${addr}`);
    const code = await provider.getCode(addr);
    console.log(`Bytecode length: ${code.length}`);
    if (code === "0x") {
      console.log("No bytecode found.");
      continue;
    }

    const contract = new ethers.Contract(addr, abi, provider);
    try {
      const owner = await contract.owner();
      console.log("  Owner:", owner);
      const isAuth = await contract.authorizedIssuers(signer.address);
      console.log(`  Signer (${signer.address}) authorized:`, isAuth);
      const totalBatches = await contract.totalAnchoredBatches();
      console.log("  Total Anchored Batches:", totalBatches.toString());

      console.log(`🎉 MATCH! Address ${addr} IS a valid BatchCertificateRegistry contract on Polygon Amoy!`);
    } catch (err) {
      console.log("  Error checking ABI match:", err.message);
    }
  }
}

main().catch(console.error);
