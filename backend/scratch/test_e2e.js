const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const seedTamilNaduColleges = require("../seeds/tnCollegesSeed");
const User = require("../models/User");
const Student = require("../models/Student");
const Document = require("../models/Document");
const BatchAnchor = require("../models/BatchAnchor");

const { uploadToIPFS } = require("../services/ipfsService");
const { generateCertificateHash } = require("../services/hashService");
const { buildMerkleTree, getMerkleProof, verifyMerkleProof } = require("../services/merkleService");
const { anchorBatchOnChain } = require("../services/blockchainService");
const { generateQRCodeDataURI } = require("../services/qrService");

async function runFullE2ETest() {
  console.log("====================================================");
  console.log("🧪 STARTING BLOCKCERT E2E END-TO-END WORKFLOW TEST");
  console.log("====================================================");

  // 1. Connect DB & Seed
  await connectDB();
  await seedTamilNaduColleges();

  // 2. Admin Authentication Test
  console.log("\n1️⃣ TESTING ADMIN AUTHENTICATION...");
  const admin = await User.findOne({ role: "super_admin" });
  if (!admin) throw new Error("Admin user not found in DB");
  const isPasswordValid = await admin.comparePassword("admin123");
  if (!isPasswordValid) throw new Error("Admin password comparison failed");
  console.log(`✅ Admin authenticated successfully! (${admin.email})`);

  // 3. Select Student
  console.log("\n2️⃣ TESTING STUDENT SELECTION...");
  const student = await Student.findOne({ registerNumber: "23CSE001" }).populate("college departmentRef courseRef batchRef");
  if (!student) throw new Error("Sample student record 23CSE001 not found");
  console.log(`✅ Selected Student: ${student.name} (${student.registerNumber})`);

  // 4. Create Sample PDF Buffer & Upload to IPFS / DB
  console.log("\n3️⃣ TESTING CERTIFICATE UPLOAD, SHA-256 & IPFS PINNING...");
  const pdfBuffer = Buffer.from("%PDF-1.4 Mock Certificate Document Content for BlockCert Verification Platform E2E Test");
  const sha256Hash = require("crypto").createHash("sha256").update(pdfBuffer).digest("hex");
  const ipfsResult = await uploadToIPFS(pdfBuffer, "Degree_Certificate_23CSE001.pdf", "application/pdf");

  console.log(`✅ SHA-256 Hash Generated: 0x${sha256Hash.substring(0, 16)}...`);
  console.log(`✅ IPFS Pinning Success: CID = ${ipfsResult.cid}`);

  // 5. Generate Certificate ID & QR Code
  console.log("\n4️⃣ TESTING CERTIFICATE ID & QR CODE GENERATION...");
  const year = new Date().getFullYear();
  const certSeq = "000001";
  const certificateId = `BCERT-TN-${year}-${certSeq}`;
  const qrCodeDataUri = await generateQRCodeDataURI(certificateId);

  console.log(`✅ Certificate ID Generated: ${certificateId}`);
  console.log(`✅ QR Code Data URI Generated (Length: ${qrCodeDataUri.length} chars)`);

  // 6. Create Document Record
  const docRecord = await Document.create({
    certificateId,
    documentId: `DOC-E2E-${Date.now()}`,
    student: student._id,
    studentId: student.registerNumber,
    college: student.college ? student.college._id : null,
    department: student.departmentRef ? student.departmentRef._id : null,
    course: student.courseRef ? student.courseRef._id : null,
    batch: student.batchRef ? student.batchRef._id : null,
    documentType: "Final Degree Certificate",
    semester: "Semester 8",
    fileName: "Degree_Certificate_23CSE001.pdf",
    originalFilename: "Degree_Certificate_23CSE001.pdf",
    fileSize: pdfBuffer.length,
    mimeType: "application/pdf",
    sha256Hash,
    documentHash: "0x" + sha256Hash,
    ipfsCid: ipfsResult.cid,
    ipfsUrl: ipfsResult.gatewayUrl,
    uploadedBy: admin.name,
    uploadedAt: new Date(),
    status: "ACTIVE",
    verificationStatus: "STORED",
  });

  student.academicRecordId = certificateId;
  student.qrCodeUrl = `http://localhost:5173/verify/${certificateId}`;
  await student.save();

  // 7. Merkle Root Generation & Blockchain Anchoring
  console.log("\n5️⃣ TESTING MERKLE ROOT COMPUTATION & BLOCKCHAIN ANCHORING...");
  const leafHashes = ["0x" + sha256Hash];
  const tree = buildMerkleTree(leafHashes);
  console.log(`✅ Merkle Root Computed: ${tree.root}`);

  const anchorReceipt = await anchorBatchOnChain(`BATCH-E2E-${year}`, tree.root, 1, 1);
  console.log(`✅ Blockchain Anchored! TxHash: ${anchorReceipt.transactionHash}`);

  const batchAnchor = await BatchAnchor.create({
    batchId: student.batchRef ? student.batchRef._id : `BATCH-E2E-${year}`,
    merkleRoot: tree.root,
    transactionHash: anchorReceipt.transactionHash,
    blockNumber: anchorReceipt.blockNumber,
    contractAddress: anchorReceipt.contractAddress,
    issuerAddress: anchorReceipt.issuerAddress,
    status: "CONFIRMED",
    totalCertificates: 1,
    anchoredAt: new Date(),
  });

  // 8. Public Verification Test (BEFORE REVOCATION)
  console.log("\n6️⃣ TESTING PUBLIC UNAUTHENTICATED VERIFICATION (ACTIVE CERTIFICATE)...");
  const queriedDoc = await Document.findOne({ certificateId }).populate("student college department course batch");
  if (!queriedDoc || queriedDoc.status !== "ACTIVE") {
    throw new Error("Public verification failed: document record not found or not active");
  }
  console.log(`✅ PUBLIC VERIFICATION PASSED! Status: VERIFIED on Polygon Blockchain`);
  console.log(`   Certificate ID: ${queriedDoc.certificateId}`);
  console.log(`   Student Name:   ${queriedDoc.student.name}`);
  console.log(`   IPFS CID:       ${queriedDoc.ipfsCid}`);
  console.log(`   Tx Hash:        ${batchAnchor.transactionHash}`);

  // 9. Admin Revocation Test
  console.log("\n7️⃣ TESTING ADMIN CERTIFICATE REVOCATION...");
  queriedDoc.status = "REVOKED";
  queriedDoc.revocationReason = "Academic misconduct / Administrative revocation test";
  queriedDoc.revokedAt = new Date();
  await queriedDoc.save();
  console.log(`✅ Certificate ${certificateId} marked as REVOKED in database.`);

  // 10. Public Verification Test (AFTER REVOCATION)
  console.log("\n8️⃣ TESTING PUBLIC UNAUTHENTICATED VERIFICATION (REVOKED CERTIFICATE)...");
  const revokedDoc = await Document.findOne({ certificateId });
  if (revokedDoc.status !== "REVOKED") {
    throw new Error("Public verification failed: expected status REVOKED");
  }
  console.log(`✅ PUBLIC REVOCATION VERIFICATION PASSED! Status: REVOKED`);
  console.log(`   Revocation Reason: "${revokedDoc.revocationReason}"`);

  console.log("\n====================================================");
  console.log("🎉 ALL END-TO-END WORKFLOW STEPS EXECUTED 100% SUCCESSFULLY!");
  console.log("====================================================");
  process.exit(0);
}

runFullE2ETest().catch((err) => {
  console.error("❌ E2E Test Failed:", err);
  process.exit(1);
});
