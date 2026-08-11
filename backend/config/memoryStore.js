const { generateCertificateHash } = require("../services/hashService");
const { buildMerkleTree, getMerkleProof } = require("../services/merkleService");

const fallbackStudents = [
  {
    _id: "65d000000000000000000001",
    studentId: "STU-2026-001",
    registerNumber: "REG-987001",
    name: "Abhirami J",
    email: "abhirami@example.com",
    phone: "+91 9876543210",
    department: "Computer Science",
    batch: "2022-2026",
    graduationYear: 2026,
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  },
  {
    _id: "65d000000000000000000002",
    studentId: "STU-2026-002",
    registerNumber: "REG-987002",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 9876543211",
    department: "Information Technology",
    batch: "2022-2026",
    graduationYear: 2026,
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  },
];

const fallbackCourses = [
  {
    _id: "65c000000000000000000001",
    courseId: "CS-401",
    name: "BLOCKCHAIN FUNDAMENTALS",
    description: "Comprehensive study of Web3 architecture, smart contracts in Solidity, and consensus protocols.",
    duration: "12 Weeks",
    credits: 4,
    instructor: "Dr. Evelyn Reed",
    department: "Computer Science",
  },
];

// Generate candidate hashes
const cert1Hash = generateCertificateHash({
  certificateId: "BCERT-2026-000001",
  studentId: "REG-987001",
  courseId: "CS-401",
  grade: "A+",
  completionDate: "10 Aug 2026",
  institutionId: "ABC Institute of Technology",
});

const cert2Hash = generateCertificateHash({
  certificateId: "BCERT-2026-000002",
  studentId: "REG-987002",
  courseId: "CS-401",
  grade: "A",
  completionDate: "05 Jul 2026",
  institutionId: "ABC Institute of Technology",
});

const tree = buildMerkleTree([cert1Hash, cert2Hash]);
const merkleRoot = tree.root;

const fallbackCertificates = [
  {
    _id: "65b000000000000000000001",
    certificateId: "BCERT-2026-000001",
    student: fallbackStudents[0],
    course: fallbackCourses[0],
    grade: "A+",
    completionDate: "10 Aug 2026",
    institutionId: "ABC Institute of Technology",
    certificateType: "Certificate of Completion",
    certificateHash: cert1Hash,
    batchId: "BATCH-2026-CSE-A",
    merkleRoot: merkleRoot,
    merkleProof: getMerkleProof(tree, cert1Hash),
    pdfUrl: "/uploads/cert_BCERT-2026-000001.pdf",
    qrVerificationUrl: "http://localhost:5173/verify/BCERT-2026-000001",
    transactionHash: "0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    blockNumber: 1542389,
    issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    issuedAt: new Date(),
    status: "VERIFIED",
  },
  {
    _id: "65b000000000000000000002",
    certificateId: "BCERT-2026-000002",
    student: fallbackStudents[1],
    course: fallbackCourses[0],
    grade: "A",
    completionDate: "05 Jul 2026",
    institutionId: "ABC Institute of Technology",
    certificateType: "Certificate of Completion",
    certificateHash: cert2Hash,
    batchId: "BATCH-2026-CSE-A",
    merkleRoot: merkleRoot,
    merkleProof: getMerkleProof(tree, cert2Hash),
    pdfUrl: "/uploads/cert_BCERT-2026-000002.pdf",
    qrVerificationUrl: "http://localhost:5173/verify/BCERT-2026-000002",
    transactionHash: "0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    blockNumber: 1542389,
    issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    issuedAt: new Date(),
    status: "VERIFIED",
  },
];

const fallbackBatches = [
  {
    _id: "65a000000000000000000010",
    batchId: "BATCH-2026-CSE-A",
    name: "Computer Science Class of 2026",
    department: "Computer Science",
    academicYear: "2026",
    totalCertificates: 2,
    merkleRoot: merkleRoot,
    transactionHash: "0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    blockNumber: 1542389,
    issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    status: "ANCHORED",
    anchoredAt: new Date(),
  },
];

module.exports = {
  fallbackStudents,
  fallbackCourses,
  fallbackCertificates,
  fallbackBatches,
};
