const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const College = require("../models/College");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const User = require("../models/User");

async function seedTamilNaduColleges() {
  console.log("====================================================");
  console.log("🏫 SEEDING TAMIL NADU MASTER COLLEGES & COURSES DATASET");
  console.log("====================================================");

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  console.log("Clearing existing master dataset & user accounts...");
  await College.deleteMany({});
  await Department.deleteMany({});
  await Course.deleteMany({});
  await Batch.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({});

  const collegesMasterList = [
    {
      collegeId: "COL-ACET",
      collegeCode: "7301",
      collegeName: "Aishwarya College of Engineering and Technology",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Errappanaickenpalayam, Kathirampatti, Erode - 638107",
    },
    {
      collegeId: "COL-ALAMEEN",
      collegeCode: "7303",
      collegeName: "Al-Ameen Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Karundevampalayam, Nanjai Uttukuli, Erode - 638104",
    },
    {
      collegeId: "COL-BIT",
      collegeCode: "7304",
      collegeName: "Bannari Amman Institute of Technology",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University (Autonomous)",
      address: "Alathukombai Post, Sathyamangalam, Erode - 638401",
    },
    {
      collegeId: "COL-ESEC",
      collegeCode: "7308",
      collegeName: "Erode Sengunthar Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University (Autonomous)",
      address: "Thudupathi, Perundurai, Erode - 638057",
    },
    {
      collegeId: "COL-GCEE",
      collegeCode: "7311",
      collegeName: "Government College of Engineering, Erode",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Vasavi College Post, Erode - 638316",
    },
    {
      collegeId: "COL-JKKM",
      collegeCode: "7313",
      collegeName: "J.K.K. Munirajah College of Technology",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "T.N.Palayam, Gobi, Erode - 638506",
    },
    {
      collegeId: "COL-KONGU",
      collegeCode: "7314",
      collegeName: "Kongu Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University (Autonomous)",
      address: "Perundurai, Erode - 638060",
    },
    {
      collegeId: "COL-MPNMJ",
      collegeCode: "7317",
      collegeName: "M.P. Nachimuthu M. Jaganathan Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Chennimalai, Erode - 638112",
    },
    {
      collegeId: "COL-NCT",
      collegeCode: "7322",
      collegeName: "Nandha College of Technology",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Vaikaalmedu, Erode - 638052",
    },
    {
      collegeId: "COL-NEC",
      collegeCode: "7323",
      collegeName: "Nandha Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University (Autonomous)",
      address: "Pitchandampalayam, Erode - 638052",
    },
    {
      collegeId: "COL-SVHEC",
      collegeCode: "7329",
      collegeName: "Shree Venkateshwara Hi-Tech Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Othakudirai, Gobichettipalayam, Erode - 638455",
    },
    {
      collegeId: "COL-SEC",
      collegeCode: "7332",
      collegeName: "Surya Engineering College",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Kathirampatti, Erode - 638107",
    },
    {
      collegeId: "COL-VCET",
      collegeCode: "7335",
      collegeName: "Velalar College of Engineering and Technology",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University (Autonomous)",
      address: "Thindal, Erode - 638012",
    },
    {
      collegeId: "COL-HCE",
      collegeCode: "7338",
      collegeName: "Hindusthan College of Engineering, Chennimalai/Ingur",
      state: "Tamil Nadu",
      district: "Erode",
      university: "Anna University",
      address: "Chennimalai/Ingur, Erode - 638052",
    },
  ];

  const createdColleges = await College.insertMany(collegesMasterList);
  console.log(`✅ Seeded ${createdColleges.length} master colleges.`);

  const konguCollege = createdColleges.find((c) => c.collegeId === "COL-KONGU") || createdColleges[0];

  // Seed Departments for Primary College
  const deptsList = [
    { departmentId: "DEP-CSE", college: konguCollege._id, departmentCode: "CSE", departmentName: "Computer Science and Engineering" },
    { departmentId: "DEP-IT", college: konguCollege._id, departmentCode: "IT", departmentName: "Information Technology" },
    { departmentId: "DEP-AIDS", college: konguCollege._id, departmentCode: "AIDS", departmentName: "Artificial Intelligence and Data Science" },
    { departmentId: "DEP-ECE", college: konguCollege._id, departmentCode: "ECE", departmentName: "Electronics and Communication Engineering" },
    { departmentId: "DEP-EEE", college: konguCollege._id, departmentCode: "EEE", departmentName: "Electrical and Electronics Engineering" },
    { departmentId: "DEP-MECH", college: konguCollege._id, departmentCode: "MECH", departmentName: "Mechanical Engineering" },
    { departmentId: "DEP-CIVIL", college: konguCollege._id, departmentCode: "CIVIL", departmentName: "Civil Engineering" },
    { departmentId: "DEP-CHEM", college: konguCollege._id, departmentCode: "CHEM", departmentName: "Chemical Engineering" },
  ];
  const createdDepts = await Department.insertMany(deptsList);
  const cseDept = createdDepts[0];
  console.log(`✅ Seeded ${createdDepts.length} departments for ${konguCollege.collegeName}.`);

  // Seed 46 Master Courses
  const coursesMasterList = [
    "B.E. Computer Science & Engineering (CSE)",
    "B.Tech Information Technology (IT)",
    "B.Tech Artificial Intelligence & Data Science (AI & DS)",
    "B.E. Computer & Communication Engineering",
    "B.Tech Computer Science & Business Systems",
    "B.E. CSE – Data Science",
    "B.E. CSE – Cyber Security",
    "B.E. CSE – AI & Machine Learning",
    "B.E. CSE – Internet of Things (IoT)",
    "B.E. Electronics & Communication Engineering (ECE)",
    "B.E. Electrical & Electronics Engineering (EEE)",
    "B.E. Electronics & Instrumentation Engineering (E&I)",
    "B.E. Instrumentation & Control Engineering",
    "B.E. Electronics & Telecommunication Engineering",
    "B.E. Electronics Engineering – VLSI",
    "B.E. Biomedical Engineering",
    "B.E. Medical Electronics",
    "B.E. Mechanical Engineering",
    "B.E. Mechatronics Engineering",
    "B.E. Automobile Engineering",
    "B.E. Aeronautical Engineering",
    "B.E. Aerospace Engineering",
    "B.E. Robotics & Automation",
    "B.E. Manufacturing Engineering",
    "B.E. Production Engineering",
    "B.E. Industrial Engineering",
    "B.E. Marine Engineering",
    "B.E. Materials Science & Engineering",
    "B.E. Mechanical & Automation Engineering",
    "B.E. Civil Engineering",
    "B.E. Environmental Engineering",
    "B.E. Geo-Informatics Engineering",
    "B.E. Agricultural Engineering",
    "B.E. Safety & Fire Engineering",
    "B.Tech Chemical Engineering",
    "B.Tech Biotechnology",
    "B.Tech Chemical & Electrochemical Engineering",
    "B.E./B.Tech Food Technology",
    "B.Tech Pharmaceutical Technology",
    "B.Tech Petroleum Engineering",
    "B.Tech Petrochemical Technology",
    "B.Tech Textile Technology",
    "B.Tech Polymer / Plastic Technology",
    "B.Tech Fashion Technology",
    "B.Tech Textile Chemistry",
    "B.Tech Handloom & Textile Technology",
  ];

  const courseDocs = coursesMasterList.map((cName, idx) => ({
    courseId: `CRS-${idx + 101}`,
    college: konguCollege._id,
    department: cseDept._id,
    courseCode: `CRS-CODE-${idx + 1}`,
    courseName: cName,
    name: cName,
    degreeType: cName.startsWith("B.Tech") ? "B.Tech" : "B.E",
    duration: "4 Years",
    credits: 160,
    instructor: "Head of Department",
  }));

  const createdCourses = await Course.insertMany(courseDocs);
  const beCseCourse = createdCourses[0];
  console.log(`✅ Seeded ${createdCourses.length} master academic courses.`);

  // Seed Batches
  const batchesCSE = [
    { batchId: "BCH-KEC-2022-2026", college: konguCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2022-2026", academicYear: "2022-2026", startYear: 2022, endYear: 2026 },
    { batchId: "BCH-KEC-2023-2027", college: konguCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2023-2027", academicYear: "2023-2027", startYear: 2023, endYear: 2027 },
    { batchId: "BCH-KEC-2024-2028", college: konguCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2024-2028", academicYear: "2024-2028", startYear: 2024, endYear: 2028 },
  ];
  const createdBatches = await Batch.insertMany(batchesCSE);
  const batch2027 = createdBatches[1];
  console.log(`✅ Seeded ${createdBatches.length} batches.`);

  // Sample Student
  const initialStudents = [
    {
      studentId: "STU-23CSE001",
      registerNumber: "23CSE001",
      name: "Sri Abhirami",
      email: "sriabhirami@example.com",
      phone: "+91 9876543210",
      college: konguCollege._id,
      departmentRef: cseDept._id,
      courseRef: beCseCourse._id,
      batchRef: batch2027._id,
      department: "Computer Science and Engineering",
      degree: "B.E. Computer Science & Engineering (CSE)",
      institution: konguCollege.collegeName,
      university: konguCollege.university,
      batch: "2023-2027",
      graduationYear: 2027,
    },
    {
      studentId: "STU-23CSE002",
      registerNumber: "23CSE002",
      name: "Karthik Subramanian",
      email: "karthik.subramanian@example.com",
      phone: "+91 9876543211",
      college: konguCollege._id,
      departmentRef: cseDept._id,
      courseRef: beCseCourse._id,
      batchRef: batch2027._id,
      department: "Computer Science and Engineering",
      degree: "B.E. Computer Science & Engineering (CSE)",
      institution: konguCollege.collegeName,
      university: konguCollege.university,
      batch: "2023-2027",
      graduationYear: 2027,
    },
  ];

  const createdStudents = await Student.insertMany(initialStudents);
  console.log(`✅ Seeded ${createdStudents.length} sample student records.`);

  // Default demo users
  if (process.env.NODE_ENV !== "production") {
    await User.create({
      name: "Institution Administrator (DEV ONLY)",
      email: "admin@blockcert.io",
      passwordHash: "admin123",
      role: "super_admin",
      emailVerified: true,
      institutionId: konguCollege.collegeId,
      collegeRef: konguCollege._id,
      status: "ACTIVE",
    });

    await User.create({
      name: "Sri Abhirami (DEV ONLY)",
      email: "student@blockcert.io",
      passwordHash: "student123",
      role: "student",
      emailVerified: true,
      institutionId: konguCollege.collegeId,
      collegeRef: konguCollege._id,
      studentRef: createdStudents[0]._id,
      status: "ACTIVE",
    });

    console.log(`✅ Seeded development demo accounts.`);
  }

  console.log("====================================================");
}

if (require.main === module) {
  seedTamilNaduColleges()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding Error:", err);
      process.exit(1);
    });
}

module.exports = seedTamilNaduColleges;
