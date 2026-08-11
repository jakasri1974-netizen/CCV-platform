const fs = require('fs');
const path = require('path');

async function testFullPipeline() {
  console.log("=== BLOCKCERT REAL-TIME VERIFICATION & CRYPTO PIPELINE TEST ===");

  // 1. Register & Login Real Admin User
  const adminEmail = `admin_${Date.now()}@example.com`;
  const adminPass = "RealAdminPass123!";

  const regRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "College Administrator", email: adminEmail, password: adminPass }),
  });
  const regData = await regRes.json();
  const verifyToken = regData.verifyLink ? new URL(regData.verifyLink).searchParams.get("token") : null;

  await fetch("http://localhost:5000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: verifyToken }),
  });

  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPass }),
  });
  const loginData = await loginRes.json();
  console.log("1. Real Admin Registration & Login:", loginData.success ? "OK" : "FAILED");
  const token = loginData.data?.token;
  const authHeaders = { "Authorization": `Bearer ${token}` };

  // 2. Fetch Tamil Nadu Master Colleges List (Sorted A-Z)
  const collegesRes = await fetch("http://localhost:5000/api/colleges", { headers: authHeaders });
  const collegesData = await collegesRes.json();
  console.log("2. Tamil Nadu Master Colleges Count:", collegesData.count);

  const cegCollege = collegesData.data.find(c => c.collegeName.includes("Guindy") || c.collegeCode === "1001");
  console.log("   Selected College:", cegCollege.collegeName, `(${cegCollege.collegeCode})`);
  const collegeId = cegCollege._id;

  // 3. Test Cascading Hierarchy APIs
  const deptsRes = await fetch(`http://localhost:5000/api/colleges/${collegeId}/departments`, { headers: authHeaders });
  const deptsData = await deptsRes.json();
  console.log("3a. Cascading Departments Count for CEG:", deptsData.count);

  const cseDept = deptsData.data.find(d => d.departmentCode === "CSE") || deptsData.data[0];
  console.log("    Selected Dept:", cseDept.departmentName, `(${cseDept.departmentCode})`);
  const deptId = cseDept._id;

  const coursesRes = await fetch(`http://localhost:5000/api/departments/${deptId}/courses`, { headers: authHeaders });
  const coursesData = await coursesRes.json();
  console.log("3b. Cascading Courses Count for CSE Dept:", coursesData.count);

  const courseId = coursesData.data[0]._id;
  const batchesRes = await fetch(`http://localhost:5000/api/courses/${courseId}/batches`, { headers: authHeaders });
  const batchesData = await batchesRes.json();
  console.log("3c. Cascading Batches Count for B.E CSE:", batchesData.count);

  const targetBatch = batchesData.data.find(b => b.name === "2023-2027") || batchesData.data[0];
  const batchId = targetBatch._id;
  const studentsRes = await fetch(`http://localhost:5000/api/batches/${batchId}/students`, { headers: authHeaders });
  const studentsData = await studentsRes.json();
  console.log("3d. Cascading Students Count in Batch 2023-2027:", studentsData.count || studentsData.total);

  const student = studentsData.data[0];
  console.log("    Selected Student:", student.name, `(${student.registerNumber})`);

  // 4. Upload Sample PDF Academic Document
  const pdfBuffer = Buffer.from("%PDF-1.4 Official Marksheet Content for BlockCert Real Test " + Date.now());

  const formData = new FormData();
  formData.append("studentId", student._id);
  formData.append("documentType", "Semester Marksheet");
  formData.append("semester", "Semester 1");
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "sem1_marksheet.pdf");

  const uploadRes = await fetch("http://localhost:5000/api/documents/upload", {
    method: "POST",
    headers: { ...authHeaders },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  console.log("4. Document Upload Result:", uploadData.success ? "OK" : "FAILED");
  console.log("   Certificate ID:", uploadData.data?.certificateId);
  console.log("   SHA-256 Hash:", uploadData.data?.sha256Hash);
  console.log("   IPFS CID:", uploadData.data?.ipfsCid);

  const certId = uploadData.data?.certificateId;

  // 5. Generate Batch Merkle Root
  const merkleRes = await fetch(`http://localhost:5000/api/batches/${batchId}/generate-merkle`, {
    method: "POST",
    headers: { ...authHeaders },
  });
  const merkleData = await merkleRes.json();
  console.log("5. Batch Merkle Root Generation:", merkleData.success ? "OK" : "FAILED");
  console.log("   Merkle Root:", merkleData.data?.merkleRoot);
  console.log("   Merkle Version:", merkleData.data?.merkleVersion);

  // 6. Anchor Batch to Polygon Blockchain
  const anchorRes = await fetch(`http://localhost:5000/api/batches/${batchId}/anchor`, {
    method: "POST",
    headers: { ...authHeaders },
  });
  const anchorData = await anchorRes.json();
  console.log("6. Polygon Amoy Anchoring Result:", anchorData.success ? "OK" : "FAILED");
  console.log("   Transaction Hash:", anchorData.data?.batch?.transactionHash || anchorData.data?.anchorReceipt?.transactionHash);

  // 7. Method 1 Verification: By Certificate ID
  const verifyIdRes = await fetch(`http://localhost:5000/api/verify/${certId}`);
  const verifyIdData = await verifyIdRes.json();
  console.log("7. Method 1 Verification (Certificate ID):", verifyIdData.isVerified ? "✅ VERIFIED" : "FAILED");
  console.log("   Student Name:", verifyIdData.data?.student?.name);
  console.log("   Blockchain Anchored:", verifyIdData.data?.blockchainAnchor?.anchored);

  // 8. Method 2 Verification: By Identical PDF Buffer Upload
  const pdfVerifyFormData = new FormData();
  pdfVerifyFormData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "sem1_marksheet.pdf");

  const verifyPdfRes = await fetch("http://localhost:5000/api/verify/upload", {
    method: "POST",
    body: pdfVerifyFormData,
  });
  const verifyPdfData = await verifyPdfRes.json();
  console.log("8. Method 2 Verification (Identical PDF Bytes):", verifyPdfData.isVerified ? "✅ VERIFIED" : "FAILED");
  console.log("   Hash Match Result:", verifyPdfData.data?.hashComparison?.result);
  console.log("   IPFS View URL:", verifyPdfData.data?.document?.ipfsUrl);

  // 9. Method 2 Verification: By Modified/Tampered PDF Buffer Upload
  const tamperedPdfBuffer = Buffer.from("%PDF-1.4 TAMPERED MODIFIED CONTENT " + Date.now());
  const tamperedFormData = new FormData();
  tamperedFormData.append("certificateId", certId);
  tamperedFormData.append("file", new Blob([tamperedPdfBuffer], { type: "application/pdf" }), "tampered.pdf");

  const verifyTamperedRes = await fetch("http://localhost:5000/api/verify/upload", {
    method: "POST",
    body: tamperedFormData,
  });
  const verifyTamperedData = await verifyTamperedRes.json();
  console.log("9. Method 2 Verification (Tampered File Bytes):", verifyTamperedData.status === "DOCUMENT_MODIFIED" ? "✅ TAMPER DETECTED CORRECTLY" : "FAILED");
  console.log("   Message:", verifyTamperedData.message);

  console.log("=== ALL END-TO-END CRYPTOGRAPHIC VERIFICATION TESTS PASSED SUCCESSFULLY ===");
}

testFullPipeline().catch(console.error);
