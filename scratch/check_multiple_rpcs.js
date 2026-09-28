const path = require("path");
const ethers = require(path.join(__dirname, "../backend/node_modules/ethers"));

const TX_HASH = "0xd36b2a7fc1ab195f43f5b1e9484be0769f9b35aeb3f8fee33baaf5cb185f4532";
const RPCS = [
  "https://rpc-amoy.polygon.technology/",
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.gateway.tenderly.co",
  "https://80002.rpc.thirdweb.com",
  "https://rpc-amoy.polygon.technology"
];

async function main() {
  for (const rpc of RPCS) {
    console.log(`\nTesting RPC: ${rpc}`);
    try {
      const provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
      const network = await provider.getNetwork();
      console.log(`Chain ID: ${network.chainId}`);

      const tx = await provider.getTransaction(TX_HASH);
      if (tx) {
        console.log(`🎉 FOUND TX on ${rpc}!`);
        console.log("  From:", tx.from);
        console.log("  To:", tx.to);
        console.log("  Block Number:", tx.blockNumber);
        console.log("  Data:", tx.data);
        const receipt = await provider.getTransactionReceipt(TX_HASH);
        if (receipt) {
          console.log("  Status:", receipt.status);
          console.log("  Gas Used:", receipt.gasUsed.toString());
          console.log("  Block Number:", receipt.blockNumber);
          console.log("  Logs Count:", receipt.logs.length);
          for (let l of receipt.logs) {
            console.log("  Log Address:", l.address);
            console.log("  Log Topics:", l.topics);
            console.log("  Log Data:", l.data);
          }
        }
        return;
      } else {
        console.log(`TX not found on ${rpc}`);
      }
    } catch (e) {
      console.log(`Error connecting to ${rpc}:`, e.message);
    }
  }
}

main();
