const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const emailService = require("../services/emailService");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "blockcert_super_secret_jwt_key_2026_change_in_production",
    { expiresIn: "30d" }
  );
};

// @desc Register real user account
// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide Name, Email, and Password" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Account with this email address already exists" });
    }

    // Generate cryptographic email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password, // Pre-save hook hashes password using bcrypt
      role: "college_admin",
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      status: "PENDING",
    });

    const emailResult = await emailService.sendVerificationEmail(cleanEmail, verificationToken);

    res.status(201).json({
      success: true,
      message: emailResult.configured
        ? "Account created! A verification link has been sent to your email inbox."
        : "Account created! Email service is not configured in .env. Use verification token link to verify.",
      emailConfigured: emailResult.configured,
      verifyLink: emailResult.verifyLink || null,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify email address using token link
// @route POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired email verification token" });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.status = "ACTIVE";
    await user.save();

    res.json({
      success: true,
      message: "Email address verified successfully! You can now log in to your account.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc Login user with email or studentId & password
// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, studentId, password, identifier } = req.body;
    const loginIdentifier = (identifier || email || studentId || "").trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: "Please enter your Student ID / Email and password" });
    }

    // Try finding user by email first
    let user = await User.findOne({ email: loginIdentifier }).populate("studentRef collegeRef");

    // If not found by email, check if studentId or registerNumber matches a Student record
    if (!user) {
      const student = await Student.findOne({
        $or: [
          { studentId: { $regex: `^${loginIdentifier}$`, $options: "i" } },
          { registerNumber: { $regex: `^${loginIdentifier}$`, $options: "i" } },
        ],
      });
      if (student) {
        user = await User.findOne({
          $or: [{ studentRef: student._id }, { email: student.email.toLowerCase() }],
        }).populate("studentRef collegeRef");
      }
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid Student ID / Email address or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Your email address has not been verified yet. Please check your email inbox to verify your account.",
        emailVerified: false,
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({ success: false, message: "Your account has been suspended by system administrator" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || (user.collegeRef ? user.collegeRef.collegeName : ""),
        collegeRef: user.collegeRef,
        studentRef: user.studentRef,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Request password reset email link
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please enter your email address" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Do not disclose whether email exists for security
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const emailResult = await emailService.sendPasswordResetEmail(cleanEmail, resetToken);

    res.json({
      success: true,
      message: emailResult.configured
        ? "If an account exists with this email, a password reset link has been sent."
        : "Email service is not configured in .env. Password reset token generated.",
      emailConfigured: emailResult.configured,
      resetLink: emailResult.resetLink || null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Reset password using token link
// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired password reset token" });
    }

    user.passwordHash = password; // Pre-save hook hashes new password
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Your password has been updated successfully! You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc Setup initial password for onboarded College Admin / Student
// @route POST /api/auth/setup-password
const setupPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Invitation token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({
      invitationToken: token,
      invitationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation token" });
    }

    user.passwordHash = password;
    user.emailVerified = true;
    user.invitationToken = null;
    user.invitationTokenExpires = null;
    user.status = "ACTIVE";
    await user.save();

    res.json({
      success: true,
      message: "Account password set successfully! You can now log in to your account.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash").populate("studentRef collegeRef");
    if (!user) {
      return res.status(440).json({ success: false, message: "User session not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  setupPassword,
  getMe,
};
