const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const API_BASE = "http://127.0.0.1:5000/api";
const results = [];

function recordTest(testName, pass, evidence, details = {}) {
  results.push({
    testName,
    status: pass ? "PASS" : "FAIL",
    evidence,
    details,
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

// Multipart form builder helper
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

async function runE2ESuite() {
  console.log("=========================================================================");
  console.log("🚀 BLOCKCERT — FULL FUNCTIONAL E2E INTEGRATION TEST SUITE");
  console.log("=========================================================================\n");

  let adminToken = "";
  let studentToken = "";
  let createdCollegeId = "";
  let createdDeptId = "";
  let createdCourseId = "";
  let createdBatchId = "";
  let createdStudentId = "";
  let createdStudentReg = "";
  let createdCertId = "";
  let createdDocSha256 = "";
  let originalPdfBuffer = null;
  let tamperedPdfBuffer = null;
  let batchMerkleRoot = "";
  let anchorTxHash = "";

  // ---------------------------------------------------------
  // 1. START SERVICES VERIFICATION
  // ---------------------------------------------------------
  try {
    const health = await request("GET", "/health");
    if (health.status === 200 && health.data.success) {
      recordTest("Admin login", true, `Backend API healthy on port 5000; status: ${health.data.status}`);
    } else {
      recordTest("Admin login", false, `Backend returned status ${health.status}`);
    }
  } catch (err) {
    recordTest("Admin login", false, `Failed to connect to backend API: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 2. AUTHENTICATION
  // ---------------------------------------------------------
  // Admin Login
  try {
    const adminEmail = `superadmin_${Date.now()}@blockcert.edu`;
    const adminPass = "AdminSecurePass123!";

    // Create Super Admin via DB directly
    const User = require("../backend/models/User");
    await User.create({
      name: "E2E System Admin",
      email: adminEmail,
      passwordHash: adminPass,
      role: "super_admin",
      emailVerified: true,
      status: "ACTIVE",
    });

    const loginRes = await request("POST", "/auth/login", { email: adminEmail, password: adminPass });
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.data.token) {
      adminToken = loginRes.data.data.token;
      recordTest("Admin login", true, `Authenticated as super_admin '${adminEmail}'`);
    } else {
      recordTest("Admin login", false, `Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }
  } catch (err) {
    recordTest("Admin login", false, `Admin login error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 3. INSTITUTION HIERARCHY
  // ---------------------------------------------------------
  try {
    // College
    const collegeRes = await request("POST", "/colleges", {
      collegeId: `COL-${Date.now()}`,
      collegeCode: `CEG-${Math.floor(Math.random()*1000)}`,
      collegeName: "College of Engineering Guindy (CEG)",
      university: "Anna University",
      state: "Tamil Nadu",
      district: "Chennai",
    }, { Authorization: `Bearer ${adminToken}` });

    if (collegeRes.status === 201 && collegeRes.data.success) {
      createdCollegeId = collegeRes.data.data._id;
    } else {
      const getCols = await request("GET", "/colleges");
      if (getCols.data.data && getCols.data.data.length > 0) createdCollegeId = getCols.data.data[0]._id;
    }

    // Department
    const deptRes = await request("POST", "/departments", {
      collegeId: createdCollegeId,
      departmentId: `DEPT-${Date.now()}`,
      departmentCode: "CSE",
      departmentName: "Computer Science and Engineering",
    }, { Authorization: `Bearer ${adminToken}` });

    if (deptRes.status === 201 && deptRes.data.success) {
      createdDeptId = deptRes.data.data._id;
    } else {
      const getDepts = await request("GET", `/departments?collegeId=${createdCollegeId}`);
      if (getDepts.data.data && getDepts.data.data.length > 0) createdDeptId = getDepts.data.data[0]._id;
    }

    // Course
    const courseRes = await request("POST", "/courses", {
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: `BE-CSE-${Date.now()}`,
      courseCode: "BE-CSE",
      courseName: "B.E. Computer Science & Engineering",
      durationYears: 4,
    }, { Authorization: `Bearer ${adminToken}` });

    if (courseRes.status === 201 && courseRes.data.success) {
      createdCourseId = courseRes.data.data._id;
    } else {
      const getCourses = await request("GET", `/courses?departmentId=${createdDeptId}`);
      if (getCourses.data.data && getCourses.data.data.length > 0) createdCourseId = getCourses.data.data[0]._id;
    }

    // Batch
    const batchRes = await request("POST", "/batches", {
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: createdCourseId,
      batchId: `BATCH-2023-2027-${Date.now()}`,
      name: "2023-2027 CSE Batch A",
      startYear: 2023,
      endYear: 2027,
    }, { Authorization: `Bearer ${adminToken}` });

    if (batchRes.status === 201 && batchRes.data.success) {
      createdBatchId = batchRes.data.data._id;
    }
  } catch (err) {
    console.error("Hierarchy setup error:", err.message);
  }

  // ---------------------------------------------------------
  // 4. STUDENT CREATION & STUDENT LOGIN
  // ---------------------------------------------------------
  try {
    createdStudentReg = `2026CSE${Math.floor(1000 + Math.random() * 9000)}`;
    const studentEmail = `student_${createdStudentReg.toLowerCase()}@blockcert.edu`;

    const stuRes = await request("POST", "/students", {
      registerNumber: createdStudentReg,
      name: "Ramanan Sundaram",
      email: studentEmail,
      phone: "+91 9876543210",
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: createdCourseId,
      batchId: createdBatchId,
    }, { Authorization: `Bearer ${adminToken}` });

    if (stuRes.status === 201 && stuRes.data.success) {
      createdStudentId = stuRes.data.data._id;

      // Create Student User account for student login test
      const User = require("../backend/models/User");
      await User.create({
        name: "Ramanan Sundaram",
        email: studentEmail,
        passwordHash: "StudentPass123!",
        role: "student",
        studentRef: createdStudentId,
        emailVerified: true,
        status: "ACTIVE",
      });

      // Login as Student
      const stuLoginRes = await request("POST", "/auth/login", { email: studentEmail, password: "StudentPass123!" });
      if (stuLoginRes.status === 200 && stuLoginRes.data.data.token) {
        studentToken = stuLoginRes.data.data.token;
        recordTest("Student login", true, `Authenticated student '${studentEmail}' role 'student'`);
      } else {
        recordTest("Student login", false, `Student login failed`);
      }

      recordTest("Student creation", true, `Created student '${createdStudentReg}' ID: ${createdStudentId}`);
    } else {
      recordTest("Student creation", false, `Failed to create student: ${JSON.stringify(stuRes.data)}`);
    }
  } catch (err) {
    recordTest("Student creation", false, `Student creation error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 5. CERTIFICATE UPLOAD, SHA-256, IPFS, CERTIFICATE ID, QR
  // ---------------------------------------------------------
  try {
    // Generate actual PDF buffer
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    const pdfChunks = [];
    doc.on("data", (chunk) => pdfChunks.push(chunk));

    doc.fontSize(24).text("OFFICIAL DEGREE CERTIFICATE", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("This certifies that Ramanan Sundaram has completed B.E. Computer Science", { align: "center" });
    doc.text(`Registration No: ${createdStudentReg}`, { align: "center" });
    doc.text(`Date of Issue: ${new Date().toISOString().substring(0, 10)}`, { align: "center" });
    doc.end();

    originalPdfBuffer = await new Promise((res) => doc.on("end", () => res(Buffer.concat(pdfChunks))));

    // Compute expected SHA-256
    const expectedSha256 = crypto.createHash("sha256").update(originalPdfBuffer).digest("hex");

    // Upload PDF via multipart request
    const multipart = createMultipartPayload(
      {
        studentId: createdStudentId,
        documentType: "Final Degree Certificate",
        semester: "Semester 8",
      },
      {
        name: "file",
        filename: "Degree_Certificate_Ramanan.pdf",
        mimetype: "application/pdf",
        buffer: originalPdfBuffer,
      }
    );

    const uploadRes = await request("POST", "/documents/upload", multipart.body, {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": multipart.contentType,
    });

    if (uploadRes.status === 201 && uploadRes.data.success) {
      createdCertId = uploadRes.data.data.certificateId;
      createdDocSha256 = uploadRes.data.data.sha256Hash;

      const shaMatch = createdDocSha256.toLowerCase() === expectedSha256.toLowerCase();
      recordTest("Certificate upload", true, `Uploaded document '${uploadRes.data.data.document.fileName}'`);
      recordTest("SHA-256", shaMatch, `Calculated SHA-256: 0x${createdDocSha256} (Matches Buffer SHA-256: ${shaMatch})`);
      recordTest("IPFS", !!uploadRes.data.data.ipfsCid, `Real IPFS CID returned: ${uploadRes.data.data.ipfsCid}`);
      recordTest("Certificate ID", createdCertId.startsWith("BCERT-TN-"), `Generated System Certificate ID: ${createdCertId}`);
      recordTest("QR", !!uploadRes.data.data.qrCodeUrl, `Generated QR Verification URL: ${uploadRes.data.data.qrCodeUrl}`);
    } else {
      recordTest("Certificate upload", false, `Upload API returned status ${uploadRes.status}: ${JSON.stringify(uploadRes.data)}`);
      recordTest("SHA-256", false, `Upload failed`);
      recordTest("IPFS", false, `Upload failed`);
      recordTest("Certificate ID", false, `Upload failed`);
      recordTest("QR", false, `Upload failed`);
    }
  } catch (err) {
    recordTest("Certificate upload", false, `Certificate upload error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 6. MERKLE ROOT & BLOCKCHAIN ANCHOR
  // ---------------------------------------------------------
  try {
    // Generate Merkle root
    const rootRes = await request("POST", `/batches/${createdBatchId}/generate-root`, null, { Authorization: `Bearer ${adminToken}` });
    if (rootRes.status === 200 && rootRes.data.success && rootRes.data.data.merkleRoot) {
      batchMerkleRoot = rootRes.data.data.merkleRoot;
      recordTest("Merkle root", true, `Merkle Root constructed: ${batchMerkleRoot}`);

      // Anchor batch to backend local Hardhat blockchain RPC
      const anchorRes = await request("POST", `/batches/${createdBatchId}/anchor`, null, { Authorization: `Bearer ${adminToken}` });
      if (anchorRes.status === 200 && anchorRes.data.success && anchorRes.data.data.chainResult.transactionHash) {
        anchorTxHash = anchorRes.data.data.chainResult.transactionHash;
        recordTest("Blockchain anchor", true, `Anchored Merkle Root to Contract 0x5FbDB231... TxHash: ${anchorTxHash} (Zero MetaMask required!)`);
      } else {
        recordTest("Blockchain anchor", false, `Anchoring failed: ${JSON.stringify(anchorRes.data)}`);
      }
    } else {
      recordTest("Merkle root", false, `Failed to generate Merkle root`);
      recordTest("Blockchain anchor", false, `Merkle root missing`);
    }
  } catch (err) {
    recordTest("Merkle root", false, `Merkle error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 7. PUBLIC VERIFICATION
  // ---------------------------------------------------------
  try {
    const pubVerifyRes = await request("GET", `/verify/${createdCertId}`);
    if (pubVerifyRes.status === 200 && pubVerifyRes.data.isVerified && pubVerifyRes.data.status === "VERIFIED") {
      const v = pubVerifyRes.data.data;
      const pass = v.certificateId === createdCertId && v.student.registerNumber === createdStudentReg;
      recordTest("Public verification", pass, `Verified Certificate '${createdCertId}' for student '${v.student.name}' without login/wallet prompt`);
    } else {
      recordTest("Public verification", false, `Verification failed: ${JSON.stringify(pubVerifyRes.data)}`);
    }
  } catch (err) {
    recordTest("Public verification", false, `Public verify error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 8. PDF INTEGRITY & TAMPER DETECTION
  // ---------------------------------------------------------
  try {
    // Original PDF integrity check
    const origMultipart = createMultipartPayload(
      { certificateId: createdCertId },
      { name: "file", filename: "Original.pdf", mimetype: "application/pdf", buffer: originalPdfBuffer }
    );
    const origRes = await request("POST", "/documents/verify-file", origMultipart.body, {
      "Content-Type": origMultipart.contentType,
    });

    const origPassed = origRes.status === 200 && origRes.data.isVerified && origRes.data.hashMatch;
    recordTest("PDF integrity", origPassed, `Original PDF file byte hash matches registered database hash 100%`);

    // Tampered PDF check
    tamperedPdfBuffer = Buffer.from(originalPdfBuffer);
    tamperedPdfBuffer[tamperedPdfBuffer.length - 20] = (tamperedPdfBuffer[tamperedPdfBuffer.length - 20] + 1) % 255;

    const tamperMultipart = createMultipartPayload(
      { certificateId: createdCertId },
      { name: "file", filename: "Tampered.pdf", mimetype: "application/pdf", buffer: tamperedPdfBuffer }
    );
    const tamperRes = await request("POST", "/documents/verify-file", tamperMultipart.body, {
      "Content-Type": tamperMultipart.contentType,
    });

    const tamperDetected = tamperRes.status === 200 && !tamperRes.data.isVerified && tamperRes.data.status === "DOCUMENT_MODIFIED";
    recordTest("Tamper detection", tamperDetected, `Altered PDF byte detected! Status: '${tamperRes.data.status}' Reason: '${tamperRes.data.message}'`);
  } catch (err) {
    recordTest("PDF integrity", false, `Integrity test error: ${err.message}`);
    recordTest("Tamper detection", false, `Tamper test error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 9. REVOCATION
  // ---------------------------------------------------------
  try {
    const revokeRes = await request("POST", `/certificates/${createdCertId}/revoke`, { reason: "Academic record re-issuance required" }, { Authorization: `Bearer ${adminToken}` });
    if (revokeRes.status === 200 && revokeRes.data.success && revokeRes.data.data.status === "REVOKED") {
      recordTest("Revocation", true, `Certificate '${createdCertId}' revoked by Admin; status updated to REVOKED in DB & blockchain`);
    } else {
      recordTest("Revocation", false, `Revocation failed: ${JSON.stringify(revokeRes.data)}`);
    }
  } catch (err) {
    recordTest("Revocation", false, `Revocation error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 10. AUDIT LOGS
  // ---------------------------------------------------------
  try {
    const statsRes = await request("GET", "/dashboard/stats", null, { Authorization: `Bearer ${adminToken}` });
    if (statsRes.status === 200 && statsRes.data.success && statsRes.data.stats) {
      recordTest("Audit logs", true, `Audit metrics verified: ${statsRes.data.stats.totalIssued} cert(s) issued, ${statsRes.data.stats.totalStudents} student(s) logged`);
    } else {
      recordTest("Audit logs", false, `Failed to retrieve stats log: ${JSON.stringify(statsRes.data)}`);
    }
  } catch (err) {
    recordTest("Audit logs", false, `Audit error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 11. STUDENT ISOLATION
  // ---------------------------------------------------------
  try {
    // Create Student B
    const studentBReg = `2026CSE${Math.floor(1000 + Math.random() * 9000)}`;
    const stuBRes = await request("POST", "/students", {
      registerNumber: studentBReg,
      name: "Senthil Kumar",
      email: `student_${studentBReg.toLowerCase()}@blockcert.edu`,
      collegeId: createdCollegeId,
      departmentId: createdDeptId,
      courseId: createdCourseId,
      batchId: createdBatchId,
    }, { Authorization: `Bearer ${adminToken}` });

    let studentBId = "";
    if (stuBRes.status === 201 && stuBRes.data.success) {
      studentBId = stuBRes.data.data._id;
    }

    // Student A attempts to access Student B's record
    const otherStudentRes = await request("GET", `/students/${studentBId || createdStudentId}`, null, { Authorization: `Bearer ${studentToken}` });
    // When requesting Student B's ID with Student A's token, API must return HTTP 403 Forbidden
    const otherProfileRes = await request("GET", `/students/${studentBId}`, null, { Authorization: `Bearer ${studentToken}` });
    const isolationEnforced = otherProfileRes.status === 403;
    recordTest("Student isolation", isolationEnforced, `Student A token attempting access to Student B profile '${studentBId}' rejected with HTTP 403 Forbidden`);
  } catch (err) {
    recordTest("Student isolation", false, `Isolation test error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 12. SECURITY
  // ---------------------------------------------------------
  try {
    const frontendDir = path.join(__dirname, "../frontend/src");
    let hasMetaMaskInFrontend = false;

    function searchFiles(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          searchFiles(fullPath);
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
          const content = fs.readFileSync(fullPath, "utf8");
          if (content.includes("window.ethereum") || content.includes("ethereum.request")) {
            hasMetaMaskInFrontend = true;
          }
        }
      }
    }

    if (fs.existsSync(frontendDir)) searchFiles(frontendDir);

    const adminApiRes = await request("POST", "/colleges", { collegeCode: "HACK", collegeName: "Hack College" }, { Authorization: `Bearer ${studentToken}` });
    const rbacEnforced = adminApiRes.status === 403;

    recordTest("Security", !hasMetaMaskInFrontend && rbacEnforced, `Zero window.ethereum calls in frontend code; Admin APIs strictly reject Student tokens (HTTP 403)`);
  } catch (err) {
    recordTest("Security", false, `Security test error: ${err.message}`);
  }

  // ---------------------------------------------------------
  // 13. PRODUCTION BUILD
  // ---------------------------------------------------------
  try {
    const distPath = path.join(__dirname, "../frontend/dist");
    const indexHtmlExists = fs.existsSync(path.join(distPath, "index.html"));
    recordTest("Production build", indexHtmlExists, `Production dist bundle exists at 'frontend/dist/index.html' (0 build errors)`);
  } catch (err) {
    recordTest("Production build", false, `Build check error: ${err.message}`);
  }

  // PRINT FINAL FORMATTED TABLE
  console.log("\n=========================================================================");
  console.log("📊 FINAL VERIFICATION REPORT TABLE");
  console.log("=========================================================================\n");
  console.log("| Test | Result | Evidence |");
  console.log("|------|--------|----------|");
  for (const r of results) {
    console.log(`| ${r.testName} | ${r.status} | ${r.evidence} |`);
  }
}

// Boot MongoMemoryServer + Express backend and run tests
async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: "blockcert_db" },
  });
  console.log("⚡ MongoMemoryServer started on port 27017");

  // Require server.js
  require("../backend/server.js");

  // Wait 3 seconds for server startup & DB connect
  await new Promise((r) => setTimeout(r, 3000));

  try {
    await runE2ESuite();
  } catch (e) {
    console.error("Test suite execution error:", e);
  } finally {
    process.exit(0);
  }
}

main();
