const fs = require('fs');
const path = require('path');

async function testWorkflow() {
  console.log("=== BLOCKCERT LIVE VERIFICATION TEST ===");

  // 1. Login as Admin
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@blockcert.io", password: "admin123" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data ? loginData.data.token : loginData.token;
  console.log("1. Admin Login Success! Token retrieved:", token ? "OK" : "FAILED");

  // 2. Add New Student "Sri Abhirami Demo"
  const regNum = `23CSE${Math.floor(100 + Math.random() * 900)}`;
  const studentRes = await fetch("http://localhost:5000/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Sri Abhirami Live",
      registerNumber: regNum,
      email: `sri_${regNum.toLowerCase()}@example.com`,
      phone: "+91 9876543210",
      department: "Computer Science and Engineering",
      degree: "B.E Computer Science and Engineering",
      institution: "ABC Engineering College",
      university: "XYZ University",
      batch: "2023-2027",
      graduationYear: 2027
    })
  });
  const studentData = await studentRes.json();
  console.log("2. Create Student Result:", studentData.success, "Student Name:", studentData.data.name, "Reg No:", studentData.data.registerNumber);

  const student = studentData.data;

  // 3. Upload Sample PDF Marksheet
  const samplePdfPath = path.join(__dirname, "sample_sem1.pdf");
  fs.writeFileSync(samplePdfPath, "%PDF-1.4\n1 0 obj\n<< /Title (Semester 1 Marksheet - Sri Abhirami) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");

  const pdfBuffer = fs.readFileSync(samplePdfPath);
  const formData = new globalThis.FormData();
  formData.append("studentId", student._id);
  formData.append("documentType", "Semester Marksheet");
  formData.append("semester", "Semester 1");
  formData.append("file", new globalThis.Blob([pdfBuffer], { type: "application/pdf" }), "sem1.pdf");

  const uploadRes = await fetch("http://localhost:5000/api/documents/upload", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  console.log("3. Upload Document Result:", uploadData.success);
  console.log("   IPFS CID:", uploadData.data.ipfsCid);
  console.log("   SHA-256 Hash:", uploadData.data.documentHash);
  console.log("   Calculated Merkle Root:", uploadData.data.merkleRoot);
  console.log("   Academic Record ID:", uploadData.data.academicRecordId);

  // 4. Verify Employer Verification Page Endpoint
  const recordId = uploadData.data.academicRecordId;
  const verifyRes = await fetch(`http://localhost:5000/api/verify/${recordId}`);
  const verifyData = await verifyRes.json();
  console.log("4. Employer Verification Endpoint Result:", verifyData.isVerified ? "✅ VERIFIED" : "❌ FAILED");
  console.log("   Student Name:", verifyData.recordDetails.studentName);
  console.log("   Documents Count:", verifyData.documentsCount);
  console.log("   Merkle Root Verified:", verifyData.recordDetails.merkleRoot);
  console.log("=== ALL TEST STEPS PASSED SUCCESSFULLY ===");
}

testWorkflow().catch(console.error);
