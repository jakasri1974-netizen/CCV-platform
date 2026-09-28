# BlockCert – Blockchain-Based Course & Credential Verification Platform

![BlockCert Banner](https://img.shields.io/badge/Blockchain-Polygon%20PoS-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Solidity](https://img.shields.io/badge/Smart%20Contract-Solidity%200.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**BlockCert** is a full-stack enterprise platform for issuing, managing, and verifying academic credentials using smart contracts anchored on the Polygon blockchain network.

---

## 🌟 Key Features

* **Polygon PoS Smart Contract (`CredentialVerification.sol`)**: Stores immutable certificate IDs, SHA-256 canonical hashes, issuer addresses, timestamp, and validity state.
* **Privacy Compliant**: Personal student information (name, email, phone) and PDF documents remain stored off-chain in database/local storage.
* **Employer Public Verification (`/verify/:certificateId`)**: Zero friction credential verification for employers without needing MetaMask or cryptocurrency funds.
* **Zero MetaMask Backend Signer**: Server-side blockchain transaction signing using backend RPC provider and private key for seamless admin, student, and employer usage.
* **Off-Chain PDF & QR Generation**: Automatically produces downloadable certificate PDFs with embedded verification QR codes.
* **Role-Based Authentication**: Separate portals for Institution Admins and Students with JWT authentication and bcrypt password hashing.
* **Real-Time Analytics Dashboard**: Metrics cards, monthly issuance charts, recent activity logs, and Polygon node diagnostic tracking.

---

## 🏗️ Architecture

```text
                  ┌──────────────────┐
                  │ Institution Admin│
                  └────────┬─────────┘
                           │
                     REST API / JWT
                           │
                           ▼
                  ┌──────────────────┐
                  │ React Frontend   │
                  └────────┬─────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        Node/Express API       ethers.js v6
                │                     │
                ▼                     ▼
           MongoDB              Smart Contract
                │             (CredentialVerification)
                │                     │
                ▼                     ▼
        PDF / IPFS Storage       Polygon PoS Network

Employer (Public)
   │
   ▼
Public Verification (/verify)
   │
   ▼
Read-Only RPC + Backend
   │
   ▼
[ VALID / REVOKED / INVALID ]
```

---

## 🛠️ Technology Stack

* **Blockchain**: Solidity 0.8.20, Hardhat, Ethers.js v6, Polygon PoS / Amoy Testnet (80002) / Localhost (31337).
* **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons, Recharts, QRCode.react, React Router DOM v6.
* **Backend**: Node.js, Express.js, Mongoose (MongoDB), PDFKit, QRCode, JWT, bcryptjs, Helmet security, Rate limiting.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### 1. Installation

Install dependencies across all monorepo modules:

```bash
npm run install:all
```

### 2. Compile & Test Smart Contract

Compile the `CredentialVerification.sol` contract and run the automated test suite:

```bash
# Compile smart contracts
npm run compile:contracts

# Run Hardhat unit tests
npm run test:contracts
```

### 3. Deploy Smart Contract

Deploy contract to local Hardhat node or Polygon Amoy testnet. The deployment script automatically exports the address and ABI to frontend and backend configurations:

```bash
# Option A: Local Hardhat Node deployment
npm run deploy:local

# Option B: Polygon Amoy Testnet deployment (Requires funded Amoy POL)
cd blockchain && npm run deploy:amoy
```

### 4. Seed Database & Start Applications

Populate sample students, courses, certificates, and default admin accounts:

```bash
# Seed database with sample records
npm run seed:backend

# Start backend and frontend concurrently
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Institution Admin** | `admin@blockcert.io` | `admin123` |
| **Student** | `student@blockcert.io` | `student123` |

---

## 🔍 Verification Flow for Employers

1. Open [http://localhost:5173/verify](http://localhost:5173/verify)
2. Enter Certificate ID (e.g. `BCERT-2026-000001`) or scan the QR Code on any certificate PDF.
3. The platform re-computes the deterministic canonical SHA-256 hash and compares it against the Polygon smart contract record.
4. Returns **✓ BLOCKCHAIN VERIFIED**, **REVOKED**, or **INVALID**. No MetaMask wallet or gas fee is required for employers.
