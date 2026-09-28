const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blockcert_db";
  try {
    // Attempt connecting to standard MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.host || "Local DB"}`);
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      console.error(`❌ CRITICAL PRODUCTION DATABASE ERROR: MongoDB Atlas connection failed (${err.message}).`);
      console.error(`   Ensure MONGODB_URI is properly configured and database IP whitelist permits access.`);
      process.exit(1);
    }

    console.warn(`⚠️ Standard MongoDB connection failed (${err.message}). Starting In-Memory Mongo Server (DEV ONLY)...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: "4.4.18",
        },
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${mongoUri}`);
    } catch (memErr) {
      console.warn(`⚠️ In-Memory MongoDB download failed: ${memErr.message}`);
    }
  }
};

module.exports = connectDB;
