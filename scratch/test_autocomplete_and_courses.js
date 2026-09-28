const { MASTER_COURSES } = require("../frontend/src/data/masterCourses");
const { MASTER_COLLEGES } = require("../frontend/src/data/masterColleges");

console.log("=========================================================================");
console.log("🔍 TESTING MASTER DATASETS & AUTOCOMPLETE FILTERING LOGIC");
console.log("=========================================================================\n");

console.log(`[TEST 1] Master Courses Count: ${MASTER_COURSES.length} (Expected 46)`);
if (MASTER_COURSES.length !== 46) {
  console.error("❌ FAIL: Master courses count mismatch!");
  process.exit(1);
}
console.log("    ✅ PASS: Exactly 46 master courses present.\n");

console.log(`[TEST 2] Master Colleges Count: ${MASTER_COLLEGES.length} (Expected 14)`);
if (MASTER_COLLEGES.length !== 14) {
  console.error("❌ FAIL: Master colleges count mismatch!");
  process.exit(1);
}
console.log("    ✅ PASS: Exactly 14 master colleges present.\n");

// Test Course Filter Helper
function filterCourses(query) {
  const q = query.toLowerCase().trim();
  return MASTER_COURSES.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.searchTerms.toLowerCase().includes(q)
  );
}

// Test College Filter Helper
function filterColleges(query) {
  const q = query.toLowerCase().trim();
  return MASTER_COLLEGES.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.searchTerms.toLowerCase().includes(q)
  );
}

// 1. Type "CSE"
const cseResults = filterCourses("CSE");
console.log(`[TEST 3] Search Course 'CSE' -> ${cseResults.length} matches:`);
cseResults.forEach(c => console.log(`   - ${c.name}`));
if (cseResults.length === 0) throw new Error("No results for CSE");

// 2. Type "Information"
const infoResults = filterCourses("Information");
console.log(`\n[TEST 4] Search Course 'Information' -> ${infoResults.length} matches:`);
infoResults.forEach(c => console.log(`   - ${c.name}`));
if (infoResults.length === 0) throw new Error("No results for Information");

// 3. Type "mechanical"
const mechResults = filterCourses("mechanical");
console.log(`\n[TEST 5] Search Course 'mechanical' -> ${mechResults.length} matches:`);
mechResults.forEach(c => console.log(`   - ${c.name}`));
if (mechResults.length === 0) throw new Error("No results for mechanical");

// 4. Type "xyz123"
const invalidResults = filterCourses("xyz123");
console.log(`\n[TEST 6] Search Course 'xyz123' -> ${invalidResults.length} matches (Expected 0)`);
if (invalidResults.length !== 0) throw new Error("Unexpected results for invalid query");

// 5. Type "Nandha"
const nandhaColleges = filterColleges("Nandha");
console.log(`\n[TEST 7] Search College 'Nandha' -> ${nandhaColleges.length} matches (Expected 2):`);
nandhaColleges.forEach(c => console.log(`   - ${c.name}`));
if (nandhaColleges.length !== 2) throw new Error("Expected exactly 2 Nandha colleges");

// 6. Type "Erode"
const erodeColleges = filterColleges("Erode");
console.log(`\n[TEST 8] Search College 'Erode' -> ${erodeColleges.length} matches:`);
erodeColleges.forEach(c => console.log(`   - ${c.name}`));
if (erodeColleges.length === 0) throw new Error("No results for Erode colleges");

console.log("\n=========================================================================");
console.log("🎉 ALL AUTOCOMPLETE & MASTER DATASET VERIFICATIONS PASSED!");
console.log("=========================================================================");
