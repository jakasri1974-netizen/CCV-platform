const mongoose = require("mongoose");
const readline = require("readline");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const User = require("../models/User");

async function createSuperAdminCLI() {
  console.log("====================================================");
  console.log("🔐 BLOCKCERT INITIAL SUPER ADMIN ACCOUNT SETUP");
  console.log("====================================================");

  await connectDB();

  // Check if a super admin already exists
  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    console.error(`❌ ERROR: A Super Admin account ('${existingSuperAdmin.email}') already exists!`);
    console.error("For security reasons, public initial setup is disabled once a Super Admin exists.");
    process.exit(1);
  }

  // Parse command line arguments if passed e.g. --name "Name" --email "email" --password "pass"
  const args = process.argv.slice(2);
  let name = "", email = "", password = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) name = args[i + 1];
    if (args[i] === "--email" && args[i + 1]) email = args[i + 1];
    if (args[i] === "--password" && args[i + 1]) password = args[i + 1];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    if (!name) {
      name = await ask("Enter Super Admin Full Name: ");
    }
    if (!email) {
      email = await ask("Enter Super Admin Real Email Address: ");
    }
    if (!password) {
      password = await ask("Enter Super Admin Password: ");
    }

    rl.close();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      console.error("❌ ERROR: Name, Email, and Password are all required!");
      process.exit(1);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      console.error(`❌ ERROR: '${cleanEmail}' is not a valid email address!`);
      process.exit(1);
    }

    // Password strength check
    if (password.length < 6) {
      console.error("❌ ERROR: Password must be at least 6 characters long!");
      process.exit(1);
    }

    // Check if email already used
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.error(`❌ ERROR: User with email '${cleanEmail}' already exists!`);
      process.exit(1);
    }

    console.log("\nCreating Initial Super Admin Account...");
    const superAdmin = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash: password, // Pre-save hook automatically hashes with bcrypt
      role: "super_admin",
      emailVerified: true,
      institutionId: "System Central",
      status: "ACTIVE",
    });

    console.log("====================================================");
    console.log("🎉 SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log(`Name:        ${superAdmin.name}`);
    console.log(`Email:       ${superAdmin.email}`);
    console.log(`Role:        ${superAdmin.role}`);
    console.log(`Status:      ${superAdmin.status}`);
    console.log(`Verified:    ${superAdmin.emailVerified}`);
    console.log("====================================================");

    process.exit(0);
  } catch (err) {
    console.error("❌ Setup Failed:", err.message);
    process.exit(1);
  }
}

createSuperAdminCLI();
