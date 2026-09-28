# BlockCert CCV Platform — Enterprise Deployment Guide

This guide provides step-by-step technical instructions for deploying the **BlockCert Cryptographic Certificate Verification (CCV) Platform** into a production cloud environment (e.g. AWS, Render, Vercel, DigitalOcean, or On-Premise Enterprise Infrastructure).

---

## 📋 Prerequisites & Infrastructure Requirements

- **Node.js**: v18.x or v20.x LTS
- **MongoDB**: MongoDB Atlas Cluster (v6.0+) or High-Availability ReplSet
- **Blockchain**: Polygon Mainnet RPC (Alchemy / QuickNode / Infura)
- **Storage**: Pinata IPFS Account (Pro or Enterprise tier with dedicated gateway)
- **Domain**: Production FQDN (e.g. `https://credentials.university.edu`) with valid TLS/SSL Certificate

---

## 🌐 1. MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Dedicated or Shared Cluster (AWS / GCP / Azure).
3. Under **Database Access**, create a dedicated database user with `readWrite` permissions on `blockcert_db`.
4. Under **Network Access**, add the IP addresses of your backend deployment server (or `0.0.0.0/0` for serverless hosts with strict authentication).
5. Obtain the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/blockcert_db?retryWrites=true&w=majority
   ```

---

## 📌 2. Pinata IPFS Setup

1. Create an account at [Pinata IPFS](https://www.pinata.cloud/).
2. Navigate to **API Keys** and generate a new key with `pinFileToIPFS` permissions.
3. Save the **JWT Bearer Token**, **API Key**, and **Secret Key**.
4. Configure a Dedicated IPFS Gateway (e.g., `https://university.mypinata.cloud/ipfs/`).

---

## ⛓️ 3. Polygon Mainnet & Smart Contract Deployment

### Step A: Fund Issuer Wallet
- Create a dedicated backend issuer wallet address.
- Transfer sufficient **POL** (formerly MATIC) to cover transaction fees (~5–10 POL is sufficient for thousands of batch transactions).

### Step B: Configure Hardhat Environment
- Update `.env` in the project root:
  ```env
  POLYGON_MAINNET_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
  PRIVATE_KEY=0xYOUR_BACKEND_ISSUER_WALLET_PRIVATE_KEY
  ```

### Step C: Deploy Contract to Polygon Mainnet (Chain ID: 137)
- Run the Hardhat deployment command:
  ```bash
  cd blockchain && npx hardhat run scripts/deploy.js --network polygon
  ```
- The deployment script outputs the contract address and automatically exports `contractAddress.json` and ABIs to the backend and frontend configurations.

### Step D: Verify Contract Deployment on Polygonscan
- Verify the deployed address on [Polygonscan](https://polygonscan.com/).

---

## 🚀 4. Backend API Deployment

1. Provision a Node.js server (e.g., Render, Railway, AWS EC2, or Docker container).
2. Set Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=YOUR_COMPLEX_JWT_SECRET
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/blockcert_db
   CORS_ORIGIN=https://credentials.university.edu
   FRONTEND_URL=https://credentials.university.edu
   CHAIN_ID=137
   POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
   PRIVATE_KEY=0xYOUR_BACKEND_ISSUER_WALLET_PRIVATE_KEY
   PINATA_JWT=YOUR_PINATA_JWT_BEARER_TOKEN
   ```
3. Run Installation & Start:
   ```bash
   npm install --production
   npm run start:backend
   ```

---

## 🎨 5. Frontend SPA Deployment

1. Deploy the `frontend/` application to Vercel, Netlify, Cloudflare Pages, or NGINX.
2. Build Command:
   ```bash
   cd frontend && npm run build
   ```
3. Configure URL rewrite rules to redirect all SPA traffic to `index.html` (HTML5 History API Mode).

---

## 🔐 6. First Production Admin Account Creation

Execute the CLI utility on the backend server to create the initial Super Admin:

```bash
npm run create-admin
```

Input Prompt:
- **Full Name**: Institutional Administrator
- **Email**: `admin@university.edu`
- **Password**: `SecurePassword123!`

---

## 🔄 7. Backup & Disaster Recovery

- **Database Backup**: Configure automated daily snapshots in MongoDB Atlas with point-in-time recovery.
- **IPFS Pinning**: Pinata maintains multi-region replication for pinned CIDs.
- **Blockchain Records**: Immutable and permanently accessible via Polygon PoS network nodes.
