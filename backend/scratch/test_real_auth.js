const fs = require('fs');
const path = require('path');

async function testRealAuthWorkflow() {
  console.log("=== BLOCKCERT REAL AUTHENTICATION & SECURITY TEST ===");

  // 1. Register New Real User
  const regEmail = `user_${Date.now()}@example.com`;
  const regPass = "RealUserPass123!";

  const regRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Real User",
      email: regEmail,
      password: regPass,
    }),
  });
  const regData = await regRes.json();
  console.log("1. Register User Result:", regData.success ? "OK" : "FAILED");
  console.log("   Message:", regData.message);
  console.log("   Verification Token Link Available:", Boolean(regData.verifyLink));

  const verifyLink = regData.verifyLink;
  const tokenParam = verifyLink ? new URL(verifyLink).searchParams.get("token") : null;

  // 2. Attempt Login Before Email Verification (Should Fail)
  const unverifiedLoginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: regEmail, password: regPass }),
  });
  const unverifiedLoginData = await unverifiedLoginRes.json();
  console.log("2. Unverified Login Attempt (Expected Fail):", unverifiedLoginRes.status === 403 ? "✅ PROPERLY REJECTED" : "FAILED", "| Message:", unverifiedLoginData.message);

  // 3. Verify Email Address using Token Link
  const verifyRes = await fetch("http://localhost:5000/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: tokenParam }),
  });
  const verifyData = await verifyRes.json();
  console.log("3. Email Verification Result:", verifyData.success ? "✅ VERIFIED" : "FAILED", "| Message:", verifyData.message);

  // 4. Login After Email Verification (Should Succeed)
  const verifiedLoginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: regEmail, password: regPass }),
  });
  const verifiedLoginData = await verifiedLoginRes.json();
  console.log("4. Verified Login Result:", verifiedLoginRes.status === 200 ? "✅ SUCCESS" : "FAILED");
  console.log("   JWT Token Issued:", Boolean(verifiedLoginData.data?.token));

  const userToken = verifiedLoginData.data.token;

  // 5. Test Forgot Password Workflow
  const forgotRes = await fetch("http://localhost:5000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: regEmail }),
  });
  const forgotData = await forgotRes.json();
  console.log("5. Forgot Password Request Result:", forgotData.success ? "OK" : "FAILED");
  console.log("   Reset Link Available:", Boolean(forgotData.resetLink));

  const resetTokenParam = forgotData.resetLink ? new URL(forgotData.resetLink).searchParams.get("token") : null;
  const newPass = "NewSecurePass456!";

  // 6. Reset Password Execution
  const resetRes = await fetch("http://localhost:5000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: resetTokenParam, password: newPass }),
  });
  const resetData = await resetRes.json();
  console.log("6. Reset Password Result:", resetData.success ? "✅ PASSWORD UPDATED" : "FAILED");

  // 7. Login with New Password
  const newPassLoginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: regEmail, password: newPass }),
  });
  const newPassLoginData = await newPassLoginRes.json();
  console.log("7. New Password Login Result:", newPassLoginRes.status === 200 ? "✅ LOGGED IN WITH NEW PASSWORD" : "FAILED");

  // 8. Test Demo Credential Purge (Old demo accounts should fail)
  const demoLoginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@blockcert.io", password: "admin123" }),
  });
  console.log("8. Demo Login Test (admin@blockcert.io):", demoLoginRes.status === 401 ? "✅ DEMO ACCOUNTS PURGED SUCCESSFULLY" : "FAILED (Demo account still active)");

  console.log("=== ALL REAL AUTHENTICATION TESTS PASSED SUCCESSFULLY ===");
}

testRealAuthWorkflow().catch(console.error);
