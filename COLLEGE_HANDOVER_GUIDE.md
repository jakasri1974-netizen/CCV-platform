# BlockCert CCV Platform — College Administrative Handover Guide

Welcome to the **BlockCert Cryptographic Certificate Verification Platform**. This non-technical operational manual guides university administrators, department heads, and academic registry staff through managing academic credentials, issuing tamper-proof certificates, and verifying records.

---

## 🏛️ 1. Hierarchical Data Architecture

The platform organizes academic records using a strict 5-level hierarchy:

```text
Institution (College)
  └── Department (e.g., Computer Science)
       └── Course / Degree (e.g., B.E Computer Science and Engineering)
            └── Academic Batch (e.g., 2023–2027)
                 └── Student Records & Issued Certificates
```

---

## 🔑 2. Initial Administrative Login

1. Open your institution's custom portal URL (e.g., `https://credentials.university.edu/login`).
2. Enter your institutional administrator email address and password.
3. Upon successful login, you will land on the **Admin Dashboard** displaying real-time metrics, total issued certificates, pending batches, and Polygon node diagnostic status.

---

## 🏫 3. Setting Up College Hierarchy

### Step A: Configure Departments
1. Navigate to **Departments** in the sidebar.
2. Click **+ Add Department**.
3. Enter Department Code (e.g. `CSE`, `ECE`, `MECH`) and Department Name.

### Step B: Configure Courses & Degrees
1. Navigate to **Courses**.
2. Click **+ Add Course**.
3. Select Department, Degree Type (`B.E`, `B.Tech`, `M.E`, `Ph.D`), Course Name, and Total Credit requirement.

### Step C: Create Academic Batches
1. Navigate to **Batch Management**.
2. Click **+ Create Batch**.
3. Select Course and define Academic Year (e.g. `2023-2027`).

---

## 👥 4. Student Management & Bulk CSV Import

### Option A: Manual Single Student Registration
1. Navigate to **Students**.
2. Click **+ Register Student**.
3. Input Register Number (e.g., `23CSE001`), Student Name, Email, and select Department/Batch.

### Option B: Bulk CSV Import (For 1,000+ Students)
1. Navigate to **Students** → **Bulk Import**.
2. Upload a standard CSV file or paste tabular data formatted as:
   ```csv
   RegisterNumber, FullName, Email, Phone
   23CSE001, Sri Abhirami, sriabhirami@example.com, +919876543210
   23CSE002, Karthik Subramanian, karthik@example.com, +919876543211
   ```
3. The platform automatically validates records, filters out duplicate register numbers, and generates cryptographic student profile IDs.

---

## 📜 5. Certificate Issuance & IPFS Pinning

1. Navigate to **Issue Certificates**.
2. Select target Student and Document Type (e.g., *Final Degree Certificate*, *Consolidated Marksheet*).
3. Upload the official PDF certificate file.
4. Click **Issue & Anchor Certificate**:
   - The platform calculates a deterministic **SHA-256 cryptographic hash**.
   - Pins the certificate metadata and PDF to **IPFS** (decentralized storage).
   - Generates a unique Certificate ID (e.g., `BCERT-TN-2026-000001`) and an embedded **Verification QR Code**.

---

## ⛓️ 6. Merkle Root Batch Blockchain Anchoring

To eliminate high gas costs, BlockCert supports **Merkle Root Batch Anchoring**:

1. Navigate to **Batch Management**.
2. Select an academic batch with pending certificates.
3. Click **Compute Merkle Root & Anchor On-Chain**:
   - Computes a SHA-256 Merkle Tree combining all certificate hashes into a single root hash.
   - Submits **1 single transaction** to the Polygon PoS Blockchain representing the entire batch.
   - All certificates in the batch receive **✓ BLOCKCHAIN VERIFIED** status simultaneously.

---

## 🔍 7. Public Employer Verification (Zero Friction)

Employers and third parties can verify credentials without logging in or having MetaMask:

1. Open `https://credentials.university.edu/verify`.
2. **Method 1 (Certificate ID)**: Enter Certificate ID (e.g. `BCERT-TN-2026-000001`) or scan the QR Code on any certificate PDF.
3. **Method 2 (File Upload)**: Drag and drop any certificate PDF file into the dropzone.
4. The system calculates raw file bytes and verifies the SHA-256 hash and Merkle proof against Polygon blockchain records.
5. Returns instant verification status:
   - **✓ BLOCKCHAIN VERIFIED**: Genuine, unmodified certificate anchored on Polygon network.
   - **REVOKED**: Certificate was officially revoked by institution.
   - **INVALID**: File contents tampered with or certificate not found.

---

## 🚫 8. Certificate Revocation & Audit Trails

1. Navigate to **Certificates List**.
2. Select target certificate and click **Revoke Certificate**.
3. Input official Revocation Reason (e.g. *Academic dishonesty*, *Duplicate issue*).
4. The certificate status updates immediately on database and smart contract. Any employer scanning the QR code will see **REVOKED** with the exact revocation reason.
5. All verification queries, IP addresses, and timestamps are recorded in the **Audit Logs** for administrative review.
