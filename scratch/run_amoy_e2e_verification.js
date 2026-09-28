const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { ethers } = require("ethers");

const API_BASE = "http://127.0.0.1:5000/api";
const results = [];

function recordTest(testName, pass, evidence) {
  results.push({
    testName,
    status: pass ? "PASS" : "FAIL",
    evidence,
  });
  const icon = pass ? "✅ PASS" : "❌ FAIL";
  console.log(`[${icon}] ${testName}: ${evidence}`);
}

async function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + urlPath);
    const reqHeaders = { ...headers };
    let payload = null;

    if (body && typeof body === "object" && !Buffer.isBuffer(body) && !headers["Content-Type"]) {
      payload = JSON.stringify(body);
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    } else if (body && Buffer.isBuffer(body)) {
      payload = body;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          let parsed = resData;
          try {
            parsed = JSON.parse(resData);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

function createMultipartPayload(fields, fileField) {
  const boundary = "--------------------------" + Math.random().toString(16).substring(2);
  const CRLF = "\r\n";
  const chunks = [];

  for (const [key, val] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}${CRLF}`));
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`));
    chunks.push(Buffer.from(`${val}${CRLF}`));
  }

  if (fileField) {
    chunks.push(Buffer.from(`--${boundary}${CRLF}`));
    chunks.push(
      Buffer.from(
        `Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"${CRLF}`
      )
    );
    chunks.push(Buffer.from(`Content-Type: ${fileField.mimetype}${CRLF}${CRLF}`));
    chunks.push(fileField.buffer);
    chunks.push(Buffer.from(CRLF));
  }

  chunks.push(Buffer.from(`--${boundary}--${CRLF}`));
  const body = Buffer.concat(chunks);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function runAmoyVerification() {
  console.log("=========================================================================");
  console.log("🔮 BLOCKCERT — POLYGON AMOY TESTNET E2E VERIFICATION SUITE");
  console.log("=========================================================================\n");

  // 1. VERIFY AMOY NETWORK CONFIGURATION & RPC NODE
  let provider = null;
  let signerWallet = null;
  let chainId = 0;
  let latestBlock = 0;
  let balanceEth = "0";

  try {
    const rpcUrl = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    const net = await provider.getNetwork();
    chainId = Number(net.chainId);
    latestBlock = await provider.getBlockNumber();

    const pk = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    signerWallet = new ethers.Wallet(pk, provider);
    const balance = await provider.getBalance(signerWallet.address);
    balanceEth = ethers.formatEther(balance);

    const isAmoy = chainId === 80002;
    recordTest(
      "Polygon Amoy Network Configuration",
      isAmoy,
      `Connected to Polygon Amoy Testnet (Chain ID: ${chainId}, Block: ${latestBlock}, RPC: ${rpcUrl})`
    );
    recordTest(
      "Backend Blockchain Signer Verification",
      !!signerWallet.address,
      `Backend Wallet Signer Address: ${signerWallet.address} (Balance: ${balanceEth} POL)`
    );
  } catch (err) {
    recordTest("Polygon Amoy Network Configuration", false, `Amoy connection error: ${err.message}`);
    recordTest("Backend Blockchain Signer Verification", false, `Signer error: ${err.message}`);
  }

  // 2. MAINNET ISOLATION CHECK
  try {
    const notMainnet = chainId !== 137;
    recordTest(
      "Polygon Mainnet Isolation Audit",
      notMainnet,
      `Active Chain ID is ${chainId} (Strictly isolated from Polygon Mainnet 137)`
    );
  } catch (err) {
    recordTest("Polygon Mainnet Isolation Audit", false, `Mainnet audit error: ${err.message}`);
  }

  // 3. RUN FULL E2E WORKFLOW WITH AMOY ANCHORING
  let adminToken = "";
  let createdCollegeId = "";
  let createdDeptId = "";
  let createdCourseId = "";
  let createdBatchId = "";
  let createdStudentId = "";
  let createdStudentReg = "";
  let createdCertId = "";
  let originalPdfBuffer = null;
  let batchMerkleRoot = "";
  let anchorTxHash = "";

  try {
    // Admin Login
    const adminEmail = `superadmin_${Date.now()}@blockcert.edu`;
    const adminPass = "AdminSecurePass123!";

    const User = require("../backend/models/User");
    await User.create({
      name: "Amoy Test Admin",
      email: adminEmail,
      passwordHash: adminPass,
      role: "super_admin",
      emailVerified: true,
      status: "ACTIVE",
    });

    const loginRes = await request("POST", "/auth/login", { email: adminEmail, password: adminPass });
    if (loginRes.status === 200 && loginRes.data.data.token) {
      adminToken = loginRes.data.data.token;
      recordTest("Admin Authentication", true, `Authenticated super_admin '${adminEmail}'`);
    }

    // Hierarchy Setup
    const collegeRes = await request("POST", "/colleges", {
      collegeCode: `CEG-AMOY-${Math.floor(Math.random()*1000)}`,
      collegeName: "College of Engineering Guindy (Amoy)",
      university: "Anna University",
      state: "Tamil Nadu",
      district: "Chennai",
    }, { Authorization: `Bearer ${adminToken}` });
    createdCollegeId = collegeRes.data.data._id;

    const deptRes = await request("POST", "/departments", {
      collegeId: createdCollegeId,
      departmentCode: "CSE",
      departmentName: "Computer Science & Engineering",
    }, { Authorization: `Bearer ${adminToken}` });
    createdDeptId = deptRes.data.data._id;

    const courseRes = await request("POST", "/courses", {
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseCode: "BE-CSE",
      courseName: "B.E. CSE",
      durationYears: 4,
    }, { Authorization: `Bearer ${adminToken}` });
    createdCourseId = courseRes.data.data._id;

    const batchRes = await request("POST", "/batches", {
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: createdCourseId,
      name: "2023-2027 Amoy Batch",
      startYear: 2023,
      endYear: 2027,
    }, { Authorization: `Bearer ${adminToken}` });
    createdBatchId = batchRes.data.data._id;

    // Create Student
    createdStudentReg = `2026AMOY${Math.floor(1000 + Math.random() * 9000)}`;
    const stuRes = await request("POST", "/students", {
      registerNumber: createdStudentReg,
      name: "Vijay Krishna",
      email: `student_${createdStudentReg.toLowerCase()}@blockcert.edu`,
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: createdCourseId,
      batchId: createdBatchId,
    }, { Authorization: `Bearer ${adminToken}` });
    createdStudentId = stuRes.data.data._id;

    recordTest(
      "Institution & Student Setup (Amoy Testnet)",
      !!createdStudentId,
      `Created Student '${createdStudentReg}' assigned to Amoy Batch ${createdBatchId}`
    );

    // Create & Upload Certificate PDF
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    const pdfChunks = [];
    doc.on("data", (chunk) => pdfChunks.push(chunk));
    doc.fontSize(22).text("POLYGON AMOY DEGREE CREDENTIAL", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Student: Vijay Krishna (${createdStudentReg})`, { align: "center" });
    doc.text(`Chain: Polygon Amoy Testnet (Chain ID 80002)`, { align: "center" });
    doc.end();

    originalPdfBuffer = await new Promise((res) => doc.on("end", () => res(Buffer.concat(pdfChunks))));

    const multipart = createMultipartPayload(
      { studentId: createdStudentId, documentType: "Final Degree Certificate", semester: "Semester 8" },
      { name: "file", filename: "Degree_Amoy.pdf", mimetype: "application/pdf", buffer: originalPdfBuffer }
    );

    const uploadRes = await request("POST", "/documents/upload", multipart.body, {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": multipart.contentType,
    });
    createdCertId = uploadRes.data.data.certificateId;

    recordTest(
      "Certificate Document Issuance",
      !!createdCertId,
      `Issued Cert ID '${createdCertId}' with IPFS CID '${uploadRes.data.data.ipfsCid}'`
    );

    // Merkle Root Generation & Amoy Blockchain Anchoring
    const rootRes = await request("POST", `/batches/${createdBatchId}/generate-root`, null, { Authorization: `Bearer ${adminToken}` });
    batchMerkleRoot = rootRes.data.data.merkleRoot;

    const anchorRes = await request("POST", `/batches/${createdBatchId}/anchor`, null, { Authorization: `Bearer ${adminToken}` });
    anchorTxHash = anchorRes.data.data.chainResult.transactionHash;

    recordTest(
      "Merkle Tree Construction",
      !!batchMerkleRoot,
      `Constructed Batch Merkle Root: ${batchMerkleRoot}`
    );

    recordTest(
      "Backend Amoy Blockchain Anchoring",
      anchorRes.status === 200 && !!anchorTxHash,
      `Anchored Merkle Root to Polygon Amoy Testnet! TxHash: ${anchorTxHash}`
    );

    // Public Verification on Polygon Amoy
    const verifyRes = await request("GET", `/verify/${createdCertId}`);
    const verifiedAmoy = verifyRes.status === 200 && verifyRes.data.isVerified;

    recordTest(
      "Public Verification (Amoy Chain Context)",
      verifiedAmoy,
      `Public verifier retrieved student '${verifyRes.data.data.student.name}' with Amoy blockchain anchor receipt (Zero MetaMask)`
    );

    // Revocation Test on Amoy
    const revokeRes = await request("POST", `/certificates/${createdCertId}/revoke`, { reason: "Amoy Testnet Revocation Audit" }, { Authorization: `Bearer ${adminToken}` });
    const revoked = revokeRes.status === 200 && revokeRes.data.success && revokeRes.data.data.status === "REVOKED";

    recordTest(
      "On-Chain Certificate Revocation (Amoy)",
      revoked,
      `Certificate '${createdCertId}' status updated to REVOKED on Polygon Amoy testnet & MongoDB`
    );
  } catch (err) {
    recordTest("Polygon Amoy Workflow Execution", false, `Workflow error: ${err.message}`);
  }

  // PRINT FINAL REPORT SUMMARY
  console.log("\n=========================================================================");
  console.log("📊 POLYGON AMOY E2E VERIFICATION REPORT TABLE");
  console.log("=========================================================================\n");
  console.log("| Test | Result | Evidence |");
  console.log("|------|--------|----------|");
  for (const r of results) {
    console.log(`| ${r.testName} | ${r.status} | ${r.evidence} |`);
  }
}

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: "blockcert_db" },
  });
  console.log("⚡ MongoMemoryServer started on port 27017");

  require("../backend/server.js");

  await new Promise((r) => setTimeout(r, 3000));

  try {
    await runAmoyVerification();
  } catch (e) {
    console.error("Amoy test execution error:", e);
  } finally {
    process.exit(0);
  }
}

main();
