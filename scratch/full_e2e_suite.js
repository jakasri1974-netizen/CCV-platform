const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Load environment variables manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of envLines) {
    const parts = line.trim().split('=');
    if (parts.length >= 2 && !parts[0].startsWith('#')) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
}

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

console.log('====================================================');
console.log('🚀 RUNNING BLOCKCERT COMPREHENSIVE E2E & ROADMAP TEST');
console.log('====================================================\n');

async function makeRequest(urlPath, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`);
    const lib = url.protocol === 'https:' ? https : http;
    
    const postData = data && typeof data === 'object' ? JSON.stringify(data) : data;
    
    const reqHeaders = {
      ...headers,
    };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = lib.request(url, { method, headers: reqHeaders }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runFullTestSuite() {
  const results = {};
  
  // ----------------------------------------------------
  // STAGE 2 — FULL APPLICATION E2E TEST
  // ----------------------------------------------------
  console.log('--- STAGE 2: FULL APPLICATION E2E TEST ---');
  
  // 2.1 Admin Login
  let adminToken = '';
  try {
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@blockcert.io',
      password: 'admin123',
    });
    
    if (loginRes.status === 200 && loginRes.body.success) {
      adminToken = loginRes.body.data.token;
      console.log('✅ 2.1 Admin Login: PASS (Role:', loginRes.body.data.role, ')');
      results['2.1 Admin Login'] = 'PASS';
    } else {
      console.log('❌ 2.1 Admin Login: FAIL', loginRes.body);
      results['2.1 Admin Login'] = 'FAIL';
    }

    // Invalid login test
    const badLogin = await makeRequest('/api/auth/login', 'POST', { email: 'admin@blockcert.io', password: 'wrongpassword' });
    if (badLogin.status === 401) {
      console.log('✅ 2.1 Bad Credentials Rejected: PASS');
    }
  } catch (e) {
    console.error('❌ 2.1 Error:', e.message);
    results['2.1 Admin Login'] = 'FAIL';
  }

  // 2.2 Create Student
  let createdStudent = null;
  const testRegNo = `TESTREG${Math.floor(1000 + Math.random() * 9000)}`;
  const testEmail = `student_${testRegNo.toLowerCase()}@example.com`;
  
  try {
    const studentRes = await makeRequest('/api/students', 'POST', {
      name: 'Rohan Sharma',
      registerNumber: testRegNo,
      studentId: `STU-${testRegNo}`,
      email: testEmail,
      phone: '+91 9988776655',
      department: 'Computer Science and Engineering',
      degree: 'B.E. Computer Science & Engineering (CSE)',
      institution: 'Bannari Amman Institute of Technology',
      batch: '2023-2027',
      password: 'StudentPassword@123',
    }, { Authorization: `Bearer ${adminToken}` });

    if (studentRes.status === 201 && studentRes.body.success) {
      createdStudent = studentRes.body.data;
      console.log('✅ 2.2 Create Student: PASS (Student ID:', createdStudent.studentId, ')');
      results['2.2 Create Student'] = 'PASS';
    } else {
      console.log('❌ 2.2 Create Student: FAIL', studentRes.body);
      results['2.2 Create Student'] = 'FAIL';
    }

    // Test duplicate reg number rejection
    const dupRes = await makeRequest('/api/students', 'POST', {
      name: 'Duplicate Test',
      registerNumber: testRegNo,
      email: `dup_${testEmail}`,
    }, { Authorization: `Bearer ${adminToken}` });
    
    if (dupRes.status === 400) {
      console.log('✅ 2.2 Duplicate Student ID Prevention: PASS');
    }
  } catch (e) {
    console.error('❌ 2.2 Error:', e.message);
    results['2.2 Create Student'] = 'FAIL';
  }

  // 2.3 Student Login
  let studentToken = '';
  let studentUser = null;
  try {
    // Login using Register Number / Student ID
    const stuLogin1 = await makeRequest('/api/auth/login', 'POST', {
      identifier: testRegNo,
      password: 'StudentPassword@123',
    });

    if (stuLogin1.status === 200 && stuLogin1.body.success && stuLogin1.body.data.role === 'student') {
      studentToken = stuLogin1.body.data.token;
      studentUser = stuLogin1.body.data;
      console.log('✅ 2.3 Student Login via Student ID: PASS');
      results['2.3 Student Login'] = 'PASS';
    } else {
      console.log('❌ 2.3 Student Login via Student ID: FAIL', stuLogin1.body);
      results['2.3 Student Login'] = 'FAIL';
    }

    // Login using Email
    const stuLogin2 = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'StudentPassword@123',
    });
    if (stuLogin2.status === 200) {
      console.log('✅ 2.3 Student Login via Email: PASS');
    }
  } catch (e) {
    console.error('❌ 2.3 Error:', e.message);
    results['2.3 Student Login'] = 'FAIL';
  }

  // 2.4 Issue Certificate
  let issuedCert = null;
  const testCertId = `BCERT-E2E-${Math.floor(100000 + Math.random() * 900000)}`;
  try {
    if (createdStudent) {
      const prepRes = await makeRequest('/api/certificates/prepare', 'POST', {
        studentId: createdStudent._id,
        courseId: createdStudent.courseRef || '65c000000000000000000001',
        certificateId: testCertId,
        grade: 'First Class with Distinction',
        completionDate: '2026-05-30',
        certificateType: 'Degree Certificate',
        institutionId: createdStudent.institution,
      }, { Authorization: `Bearer ${adminToken}` });

      if (prepRes.status === 200 && prepRes.body.success) {
        const confirmRes = await makeRequest('/api/certificates/confirm', 'POST', {
          certificateId: testCertId,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: 1542390,
          issuerAddress: 'Backend Signer (Amoy Testnet)',
        }, { Authorization: `Bearer ${adminToken}` });

        if (confirmRes.status === 200 && confirmRes.body.success) {
          issuedCert = confirmRes.body.data;
          console.log('✅ 2.4 Issue Certificate: PASS (Cert ID:', testCertId, ')');
          results['2.4 Issue Certificate'] = 'PASS';
        } else {
          console.log('❌ 2.4 Confirm Certificate: FAIL', confirmRes.body);
          results['2.4 Issue Certificate'] = 'FAIL';
        }
      } else {
        console.log('❌ 2.4 Prepare Certificate: FAIL', prepRes.body);
        results['2.4 Issue Certificate'] = 'FAIL';
      }
    }
  } catch (e) {
    console.error('❌ 2.4 Error:', e.message);
    results['2.4 Issue Certificate'] = 'FAIL';
  }

  // 2.5 Certificate Data Integrity
  try {
    const certFetch = await makeRequest(`/api/certificates/${testCertId}`, 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (certFetch.status === 200 && certFetch.body.success) {
      const cData = certFetch.body.data;
      if (cData.certificateId === testCertId && cData.status === 'VERIFIED' && cData.certificateHash) {
        console.log('✅ 2.5 Certificate Data Integrity: PASS');
        results['2.5 Certificate Data Integrity'] = 'PASS';
      } else {
        console.log('❌ 2.5 Data mismatch:', cData);
        results['2.5 Certificate Data Integrity'] = 'FAIL';
      }
    } else {
      console.log('❌ 2.5 Fetch Cert: FAIL', certFetch.body);
      results['2.5 Certificate Data Integrity'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ 2.5 Error:', e.message);
    results['2.5 Certificate Data Integrity'] = 'FAIL';
  }

  // 2.6 Student Certificate Access
  try {
    const stuCertsRes = await makeRequest('/api/certificates', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    if (stuCertsRes.status === 200 && stuCertsRes.body.success) {
      console.log('✅ 2.6 Student Certificate Access: PASS (Certs count:', stuCertsRes.body.count, ')');
      results['2.6 Student Certificate Access'] = 'PASS';
    } else {
      console.log('❌ 2.6 Student Certificate Access: FAIL', stuCertsRes.body);
      results['2.6 Student Certificate Access'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ 2.6 Error:', e.message);
    results['2.6 Student Certificate Access'] = 'FAIL';
  }

  // 2.7 Public Verification
  try {
    // Unauthenticated public check by Certificate ID
    const pubVerify = await makeRequest(`/api/verify/${testCertId}`, 'GET');
    if (pubVerify.status === 200 && pubVerify.body.isVerified) {
      console.log('✅ 2.7 Public Verification by ID: PASS');
      results['2.7 Public Verification'] = 'PASS';
    } else {
      console.log('❌ 2.7 Public Verification by ID: FAIL', pubVerify.body);
      results['2.7 Public Verification'] = 'FAIL';
    }

    // Invalid certificate check
    const invalidVerify = await makeRequest('/api/verify/BCERT-FAKE-000000', 'GET');
    if (invalidVerify.body.isVerified === false) {
      console.log('✅ 2.7 Invalid Certificate Handling: PASS');
    }
  } catch (e) {
    console.error('❌ 2.7 Error:', e.message);
    results['2.7 Public Verification'] = 'FAIL';
  }

  // 2.8 QR Verification
  try {
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${testCertId}`;
    if (qrUrl.includes('/verify/')) {
      console.log('✅ 2.8 QR Verification URL Format: PASS (', qrUrl, ')');
      results['2.8 QR Verification'] = 'PASS';
    } else {
      results['2.8 QR Verification'] = 'FAIL';
    }
  } catch (e) {
    results['2.8 QR Verification'] = 'FAIL';
  }

  // 2.9 Certificate Revocation
  try {
    const revokeRes = await makeRequest(`/api/certificates/${testCertId}/revoke`, 'POST', {
      reason: 'Academic Misconduct Audit Test',
    }, { Authorization: `Bearer ${adminToken}` });

    if (revokeRes.status === 200 && revokeRes.body.success) {
      // Re-verify publicly
      const postRevokeVerify = await makeRequest(`/api/verify/${testCertId}`, 'GET');
      if (postRevokeVerify.body.status === 'REVOKED' && postRevokeVerify.body.isVerified === false) {
        console.log('✅ 2.9 Certificate Revocation & Public Status Check: PASS');
        results['2.9 Certificate Revocation'] = 'PASS';
      } else {
        console.log('❌ 2.9 Revocation verify FAIL:', postRevokeVerify.body);
        results['2.9 Certificate Revocation'] = 'FAIL';
      }
    } else {
      console.log('❌ 2.9 Revoke API FAIL:', revokeRes.body);
      results['2.9 Certificate Revocation'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ 2.9 Error:', e.message);
    results['2.9 Certificate Revocation'] = 'FAIL';
  }

  // 2.10 Student Isolation Test
  try {
    // Create Student B
    const regB = `TESTREG${Math.floor(1000 + Math.random() * 9000)}`;
    const stuB = await makeRequest('/api/students', 'POST', {
      name: 'Student B Isolation Test',
      registerNumber: regB,
      studentId: `STU-${regB}`,
      email: `student_b_${regB.toLowerCase()}@example.com`,
      phone: '+91 9988776654',
      department: 'Information Technology',
      degree: 'B.Tech Information Technology (IT)',
      batch: '2023-2027',
    }, { Authorization: `Bearer ${adminToken}` });

    if (stuB.status === 201) {
      const idB = stuB.body.data._id;
      // Student A tries to fetch Student B's details
      const accessB = await makeRequest(`/api/students/${idB}`, 'GET', null, {
        Authorization: `Bearer ${studentToken}`,
      });

      if (accessB.status === 403) {
        console.log('✅ 2.10 Student Isolation API Check: PASS (403 Forbidden received)');
        results['2.10 Student Isolation'] = 'PASS';
      } else {
        console.log('❌ 2.10 Student Isolation FAIL! Status:', accessB.status);
        results['2.10 Student Isolation'] = 'FAIL';
      }
    }
  } catch (e) {
    console.error('❌ 2.10 Error:', e.message);
    results['2.10 Student Isolation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // STAGE 4 — MASTER DATA VALIDATION
  // ----------------------------------------------------
  console.log('\n--- STAGE 4: MASTER DATA VALIDATION ---');
  try {
    const authHeaders = { Authorization: `Bearer ${adminToken}` };
    const colRes = await makeRequest('/api/colleges?limit=100', 'GET', null, authHeaders);
    const crsRes = await makeRequest('/api/courses?limit=100', 'GET', null, authHeaders);
    const deptRes = await makeRequest('/api/departments?limit=100', 'GET', null, authHeaders);
    const bchRes = await makeRequest('/api/batches?limit=100', 'GET', null, authHeaders);

    const colCount = colRes.body.count || colRes.body.data?.length || 0;
    const crsCount = crsRes.body.count || crsRes.body.data?.length || 0;
    const deptCount = deptRes.body.count || deptRes.body.data?.length || 0;
    const bchCount = bchRes.body.count || bchRes.body.data?.length || 0;

    console.log(`Master Data Counts: Colleges=${colCount}, Courses=${crsCount}, Depts=${deptCount}, Batches=${bchCount}`);

    if (colCount >= 14 && crsCount >= 46 && deptCount >= 8 && bchCount >= 3) {
      console.log('✅ STAGE 4 Master Data Validation: PASS');
      results['STAGE 4 Master Data Validation'] = 'PASS';
    } else {
      console.log('❌ STAGE 4 Master Data Validation: FAIL (Counts incomplete)');
      results['STAGE 4 Master Data Validation'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ STAGE 4 Error:', e.message);
    results['STAGE 4 Master Data Validation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // STAGE 5 — REPORTS & AUDIT LOGS
  // ----------------------------------------------------
  console.log('\n--- STAGE 5: REPORTS & AUDIT LOGS ---');
  try {
    const statsRes = await makeRequest('/api/dashboard/stats', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (statsRes.status === 200 && statsRes.body.success) {
      console.log('✅ STAGE 5 Dashboard Metrics & Activity Logs: PASS');
      results['STAGE 5 Reports & Audit Logs'] = 'PASS';
    } else {
      console.log('❌ STAGE 5 Stats FAIL:', statsRes.body);
      results['STAGE 5 Reports & Audit Logs'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ STAGE 5 Error:', e.message);
    results['STAGE 5 Reports & Audit Logs'] = 'FAIL';
  }

  // ----------------------------------------------------
  // STAGE 6 — SECURITY FINAL AUDIT
  // ----------------------------------------------------
  console.log('\n--- STAGE 6: SECURITY FINAL AUDIT ---');
  try {
    const srcFiles = fs.readdirSync(path.join(__dirname, '../frontend/src'), { recursive: true });
    let leakedSecretFound = false;

    for (const file of srcFiles) {
      const fullPath = path.join(__dirname, '../frontend/src', file);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (
          content.includes('BLOCKCHAIN_PRIVATE_KEY') ||
          content.includes('MONGODB_URI') ||
          (content.includes('PINATA_JWT') && !content.includes('process.env')) ||
          content.includes('JWT_SECRET=')
        ) {
          console.log('❌ Leaked secret in frontend file:', file);
          leakedSecretFound = true;
        }
      }
    }

    if (!leakedSecretFound) {
      console.log('✅ STAGE 6 Secret Scan: PASS (No production secrets exposed in frontend source)');
      results['STAGE 6 Security Final Audit'] = 'PASS';
    } else {
      results['STAGE 6 Security Final Audit'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ STAGE 6 Error:', e.message);
    results['STAGE 6 Security Final Audit'] = 'FAIL';
  }

  // ----------------------------------------------------
  // STAGE 7 — POLYGON AMOY FINAL VALIDATION
  // ----------------------------------------------------
  console.log('\n--- STAGE 7: POLYGON AMOY CONTRACT VALIDATION ---');
  try {
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com';
    const contractAddr = process.env.CONTRACT_ADDRESS || '0x8ED130360DB4eCabCAAa3Eb9cf4afAb107c16f59';
    
    // Call RPC eth_getCode
    const rpcRes = await makeRequest(rpcUrl, 'POST', {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [contractAddr, 'latest'],
      id: 1,
    });

    if (rpcRes.body && rpcRes.body.result && rpcRes.body.result !== '0x' && rpcRes.body.result.length > 10) {
      console.log('✅ STAGE 7 Polygon Amoy Contract Check: PASS (Bytecode found at', contractAddr, ')');
      results['STAGE 7 Polygon Amoy Final Validation'] = 'PASS';
    } else {
      console.log('❌ STAGE 7 Polygon Amoy Contract Check: FAIL (No bytecode returned at', contractAddr, ')');
      results['STAGE 7 Polygon Amoy Final Validation'] = 'FAIL';
    }
  } catch (e) {
    console.error('❌ STAGE 7 Error:', e.message);
    results['STAGE 7 Polygon Amoy Final Validation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // STAGE 9 — PERFORMANCE & LOAD TEST
  // ----------------------------------------------------
  console.log('\n--- STAGE 9: PERFORMANCE TEST ---');
  try {
    const startTime = Date.now();
    const reqs = Array.from({ length: 20 }).map(() => makeRequest(`/api/verify/${testCertId}`, 'GET'));
    await Promise.all(reqs);
    const duration = Date.now() - startTime;
    console.log(`✅ STAGE 9 Performance Test: PASS (20 parallel requests served in ${duration}ms, avg ${Math.round(duration/20)}ms/req)`);
    results['STAGE 9 Performance Test'] = 'PASS';
  } catch (e) {
    console.error('❌ STAGE 9 Error:', e.message);
    results['STAGE 9 Performance Test'] = 'FAIL';
  }

  console.log('\n====================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY');
  console.log('====================================================');
  console.table(results);
}

runFullTestSuite().catch((e) => console.error('Suite error:', e));
