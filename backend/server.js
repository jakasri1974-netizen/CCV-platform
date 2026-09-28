const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const College = require("./models/College");
const Course = require("./models/Course");
const seedMasterData = require("./seed");

const authRoutes = require("./routes/authRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const batchRoutes = require("./routes/batchRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const statsRoutes = require("./routes/statsRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiter for public verification
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: { success: false, message: "Too many verification requests from this IP, please try again later." },
});

// Serve off-chain PDF certificate files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/verify", verifyLimiter, verifyRoutes);
app.use("/api/dashboard", statsRoutes);

// Healthcheck Route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "BlockCert Backend API",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 Route
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
    const collegeCount = await College.countDocuments();
    const courseCount = await Course.countDocuments();
    if (collegeCount === 0 || courseCount === 0) {
      console.log("Database incomplete. Auto-seeding master college & course dataset...");
      await seedMasterData();
    }
  } catch (e) {
    console.warn("Auto-seed check warning:", e.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 BlockCert Backend API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`CORS Allowed Origin: ${process.env.CORS_ORIGIN || "*"}`);
    console.log(`====================================================`);
  });
});
