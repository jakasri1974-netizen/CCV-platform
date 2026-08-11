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
    console.warn(`⚠️ Standard MongoDB connection failed (${err.message}). Starting In-Memory Mongo Server...`);
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
      console.warn(`⚠️ In-Memory MongoDB download failed. Application will run in memory fallback mode.`);
    }
  }
};

module.exports = connectDB;
