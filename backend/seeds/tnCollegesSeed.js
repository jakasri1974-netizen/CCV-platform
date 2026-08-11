const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const College = require("../models/College");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

async function seedTamilNaduColleges() {
  console.log("====================================================");
  console.log("🏫 SEEDING TAMIL NADU MASTER COLLEGES DATASET");
  console.log("====================================================");

  await connectDB();

  console.log("Clearing existing master colleges dataset...");
  await College.deleteMany({});
  await Department.deleteMany({});
  await Course.deleteMany({});
  await Batch.deleteMany({});
  await Student.deleteMany({});

  const collegesMasterList = [
    {
      collegeId: "COL-CEG-AU",
      collegeCode: "1001",
      collegeName: "College of Engineering Guindy (CEG), Anna University",
      state: "Tamil Nadu",
      district: "Chennai",
      university: "Anna University",
      address: "Sardar Patel Road, Guindy, Chennai - 600025",
      location: "Guindy Campus",
    },
    {
      collegeId: "COL-MIT-AU",
      collegeCode: "1002",
      collegeName: "Madras Institute of Technology (MIT), Anna University",
      state: "Tamil Nadu",
      district: "Chengalpattu",
      university: "Anna University",
      address: "Chromepet, Chennai - 600044",
      location: "Chromepet Campus",
    },
    {
      collegeId: "COL-GCT-CBE",
      collegeCode: "2001",
      collegeName: "Government College of Technology (GCT)",
      state: "Tamil Nadu",
      district: "Coimbatore",
      university: "Anna University",
      address: "Thadagam Road, Coimbatore - 641013",
      location: "Coimbatore Campus",
    },
    {
      collegeId: "COL-PSG-TECH",
      collegeCode: "2004",
      collegeName: "PSG College of Technology",
      state: "Tamil Nadu",
      district: "Coimbatore",
      university: "Anna University",
      address: "Avinashi Road, Peelamedu, Coimbatore - 641004",
      location: "Peelamedu Campus",
    },
    {
      collegeId: "COL-CIT-CBE",
      collegeCode: "2006",
      collegeName: "Coimbatore Institute of Technology (CIT)",
      state: "Tamil Nadu",
      district: "Coimbatore",
      university: "Anna University",
      address: "Civil Aerodrome Post, Coimbatore - 641014",
      location: "Avinashi Road Campus",
    },
    {
      collegeId: "COL-TCE-MDU",
      collegeCode: "5008",
      collegeName: "Thiagarajar College of Engineering (TCE)",
      state: "Tamil Nadu",
      district: "Madurai",
      university: "Anna University",
      address: "Thiruparankundram, Madurai - 625015",
      location: "Madurai Campus",
    },
    {
      collegeId: "COL-SSN-CHE",
      collegeCode: "1315",
      collegeName: "Sri Sivasubramaniya Nadar (SSN) College of Engineering",
      state: "Tamil Nadu",
      district: "Chengalpattu",
      university: "Anna University",
      address: "Old Mahabalipuram Road, Kalavakkam - 603110",
      location: "OMR Campus",
    },
    {
      collegeId: "COL-GCE-SLM",
      collegeCode: "2601",
      collegeName: "Government College of Engineering",
      state: "Tamil Nadu",
      district: "Salem",
      university: "Anna University",
      address: "NH 44, Karuppur, Salem - 636011",
      location: "Salem Campus",
    },
    {
      collegeId: "COL-VIT-VEL",
      collegeCode: "VIT01",
      collegeName: "Vellore Institute of Technology (VIT)",
      state: "Tamil Nadu",
      district: "Vellore",
      university: "VIT Deemed University",
      address: "Katpadi - Thiruvalam Road, Vellore - 632014",
      location: "Vellore Campus",
    },
    {
      collegeId: "COL-SRM-KTR",
      collegeCode: "SRM01",
      collegeName: "SRM Institute of Science and Technology",
      state: "Tamil Nadu",
      district: "Chengalpattu",
      university: "SRM Deemed University",
      address: "Kattankulathur - 603203",
      location: "Kattankulathur Campus",
    },
    {
      collegeId: "COL-SASTRA",
      collegeCode: "SASTRA01",
      collegeName: "SASTRA Deemed University",
      state: "Tamil Nadu",
      district: "Thanjavur",
      university: "SASTRA Deemed University",
      address: "Tirumalaisamudram, Thanjavur - 613401",
      location: "Thanjavur Campus",
    },
    {
      collegeId: "COL-ACGCET",
      collegeCode: "5002",
      collegeName: "Alagappa Chettiar Government College of Engineering & Technology",
      state: "Tamil Nadu",
      district: "Sivaganga",
      university: "Anna University",
      address: "College Road, Karaikudi - 630003",
      location: "Karaikudi Campus",
    },
  ];

  const createdColleges = await College.insertMany(collegesMasterList);
  console.log(`✅ Seeded ${createdColleges.length} Tamil Nadu master colleges.`);

  // Create Departments for CEG Anna University & GCT Coimbatore
  const cegCollege = createdColleges[0];
  const deptsCEG = [
    { departmentId: "DEP-CEG-CSE", college: cegCollege._id, departmentCode: "CSE", departmentName: "Computer Science and Engineering" },
    { departmentId: "DEP-CEG-ECE", college: cegCollege._id, departmentCode: "ECE", departmentName: "Electronics and Communication Engineering" },
    { departmentId: "DEP-CEG-EEE", college: cegCollege._id, departmentCode: "EEE", departmentName: "Electrical and Electronics Engineering" },
    { departmentId: "DEP-CEG-MECH", college: cegCollege._id, departmentCode: "MECH", departmentName: "Mechanical Engineering" },
    { departmentId: "DEP-CEG-CIVIL", college: cegCollege._id, departmentCode: "CIVIL", departmentName: "Civil Engineering" },
    { departmentId: "DEP-CEG-AIDS", college: cegCollege._id, departmentCode: "AIDS", departmentName: "Artificial Intelligence & Data Science" },
  ];
  const createdDepts = await Department.insertMany(deptsCEG);
  const cseDept = createdDepts[0];
  console.log(`✅ Seeded ${createdDepts.length} departments for ${cegCollege.collegeName}.`);

  // Create Courses for CSE Department
  const coursesCSE = [
    { courseId: "CRS-CEG-BECSE", college: cegCollege._id, department: cseDept._id, courseCode: "BE-CSE", courseName: "B.E Computer Science and Engineering", degreeType: "B.E", duration: "4 Years", credits: 160 },
    { courseId: "CRS-CEG-BTAIDS", college: cegCollege._id, department: cseDept._id, courseCode: "BT-AIDS", courseName: "B.Tech Artificial Intelligence and Data Science", degreeType: "B.Tech", duration: "4 Years", credits: 160 },
    { courseId: "CRS-CEG-MECSE", college: cegCollege._id, department: cseDept._id, courseCode: "ME-CSE", courseName: "M.E Computer Science and Engineering", degreeType: "M.E", duration: "2 Years", credits: 80 },
  ];
  const createdCourses = await Course.insertMany(coursesCSE);
  const beCseCourse = createdCourses[0];
  console.log(`✅ Seeded ${createdCourses.length} courses for CSE Department.`);

  // Create Batches for B.E CSE
  const batchesCSE = [
    { batchId: "BCH-CEG-2022-2026", college: cegCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2022-2026", academicYear: "2022-2026", startYear: 2022, endYear: 2026 },
    { batchId: "BCH-CEG-2023-2027", college: cegCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2023-2027", academicYear: "2023-2027", startYear: 2023, endYear: 2027 },
    { batchId: "BCH-CEG-2024-2028", college: cegCollege._id, department: cseDept._id, course: beCseCourse._id, name: "2024-2028", academicYear: "2024-2028", startYear: 2024, endYear: 2028 },
  ];
  const createdBatches = await Batch.insertMany(batchesCSE);
  const batch2027 = createdBatches[1];
  console.log(`✅ Seeded ${createdBatches.length} batches for B.E CSE.`);

  // Create Sample Student Records
  const initialStudents = [
    {
      studentId: "STU-23CSE001",
      registerNumber: "23CSE001",
      name: "Sri Abhirami",
      email: "sriabhirami@example.com",
      phone: "+91 9876543210",
      college: cegCollege._id,
      departmentRef: cseDept._id,
      courseRef: beCseCourse._id,
      batchRef: batch2027._id,
      department: "Computer Science and Engineering",
      degree: "B.E Computer Science and Engineering",
      institution: cegCollege.collegeName,
      university: cegCollege.university,
      batch: "2023-2027",
      graduationYear: 2027,
    },
    {
      studentId: "STU-23CSE002",
      registerNumber: "23CSE002",
      name: "Karthik Subramanian",
      email: "karthik.subramanian@example.com",
      phone: "+91 9876543211",
      college: cegCollege._id,
      departmentRef: cseDept._id,
      courseRef: beCseCourse._id,
      batchRef: batch2027._id,
      department: "Computer Science and Engineering",
      degree: "B.E Computer Science and Engineering",
      institution: cegCollege.collegeName,
      university: cegCollege.university,
      batch: "2023-2027",
      graduationYear: 2027,
    },
  ];

  const createdStudents = await Student.insertMany(initialStudents);
  console.log(`✅ Seeded ${createdStudents.length} sample student records.`);
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
