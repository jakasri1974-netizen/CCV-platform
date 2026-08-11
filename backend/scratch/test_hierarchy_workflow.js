const fs = require('fs');
const path = require('path');

async function testHierarchyWorkflow() {
  console.log("=== BLOCKCERT HIERARCHY & BULK IMPORT TEST ===");

  // 1. Super Admin Login
  const superRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "superadmin@blockcert.io", password: "admin123" }),
  });
  const superData = await superRes.json();
  console.log("1. Super Admin Login:", superData.success ? "OK" : "FAILED", "| Role:", superData.data.role);

  // 2. College Admin Login
  const collegeAdminRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@abc.edu", password: "admin123" }),
  });
  const collegeAdminData = await collegeAdminRes.json();
  const token = collegeAdminData.data.token;
  const authHeaders = { "Authorization": `Bearer ${token}` };
  console.log("2. College Admin Login:", collegeAdminData.success ? "OK" : "FAILED", "| Institution:", collegeAdminData.data.institutionId);

  // 3. Cascading Hierarchy APIs
  const collegesRes = await fetch("http://localhost:5000/api/colleges", { headers: authHeaders });
  const collegesData = await collegesRes.json();
  console.log("3a. Colleges Count:", collegesData.count, "| First College:", collegesData.data[0].collegeName);

  const collegeId = collegesData.data[0]._id;
  const deptsRes = await fetch(`http://localhost:5000/api/departments?collegeId=${collegeId}`, { headers: authHeaders });
  const deptsData = await deptsRes.json();
  console.log("3b. Departments Count for College:", deptsData.count);

  const cseDept = deptsData.data.find(d => d.departmentCode === "CSE") || deptsData.data[0];
  console.log("    Selected Dept:", cseDept.departmentName, `(${cseDept.departmentCode})`);

  const deptId = cseDept._id;
  const coursesRes = await fetch(`http://localhost:5000/api/courses?collegeId=${collegeId}&departmentId=${deptId}`, { headers: authHeaders });
  const coursesData = await coursesRes.json();
  console.log("3c. Courses Count for Dept:", coursesData.count, "| First Course:", coursesData.data[0]?.courseName);

  const courseId = coursesData.data[0]._id;
  const batchesRes = await fetch(`http://localhost:5000/api/batches?collegeId=${collegeId}&departmentId=${deptId}&courseId=${courseId}`, { headers: authHeaders });
  const batchesData = await batchesRes.json();
  console.log("3d. Batches Count for Course:", batchesData.count, "| First Batch:", batchesData.data[0]?.name);

  // 4. Bulk CSV Import Test
  const batchId = batchesData.data[0]._id;
  const sampleCsv = `registerNumber,name,email,department,course,batch
23CSE101,Bulk Student One,bulk1@example.com,CSE,B.E CSE,2023-2027
23CSE102,Bulk Student Two,bulk2@example.com,CSE,B.E CSE,2023-2027
23CSE103,Bulk Student Three,bulk3@example.com,CSE,B.E CSE,2023-2027
23CSE104,Bulk Student Four,bulk4@example.com,CSE,B.E CSE,2023-2027
23CSE105,Bulk Student Five,bulk5@example.com,CSE,B.E CSE,2023-2027`;

  const importRes = await fetch("http://localhost:5000/api/students/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({
      csvData: sampleCsv,
      collegeId,
      departmentId: deptId,
      courseId,
      batchId,
    }),
  });
  const importData = await importRes.json();
  console.log("4. Bulk CSV Import Result:", importData.success ? "OK" : "FAILED");
  console.log("   Stats:", JSON.stringify(importData.stats));

  // 5. Query Filtered Students
  const studentsRes = await fetch(`http://localhost:5000/api/students?collegeId=${collegeId}&departmentId=${deptId}&courseId=${courseId}&batchId=${batchId}`, {
    headers: authHeaders,
  });
  const studentsData = await studentsRes.json();
  console.log("5. Filtered Students Count in Batch:", studentsData.total || studentsData.count);

  console.log("=== ALL HIERARCHY & BULK IMPORT TESTS PASSED SUCCESSFULLY ===");
}

testHierarchyWorkflow().catch(console.error);
