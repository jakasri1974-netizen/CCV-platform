const https = require('https');

const rpcs = [
  'https://1rpc.io/matic',
  'https://polygon.llamarpc.com',
  'https://rpc.ankr.com/polygon',
  'https://polygon-mainnet.public.blastapi.io',
  'https://nodes.mewapi.io/rpc/eth'
];

async function testRpc(urlStr) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ url: urlStr, status: res.statusCode, chainId: json.result, error: json.error });
        } catch (e) {
          resolve({ url: urlStr, status: res.statusCode, error: body });
        }
      });
    });

    req.on('error', (e) => resolve({ url: urlStr, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url: urlStr, error: 'timeout' }); });
    req.write(data);
    req.end();
  });
}

async function main() {
  for (const rpc of rpcs) {
    const res = await testRpc(rpc);
    console.log(res);
  }
}

main();
