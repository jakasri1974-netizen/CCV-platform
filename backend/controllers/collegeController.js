const crypto = require("crypto");
const College = require("../models/College");
const User = require("../models/User");
const emailService = require("../services/emailService");

// @desc Get all registered colleges (Searchable, Sorted A-Z)
// @route GET /api/colleges
const getColleges = async (req, res, next) => {
  try {
    const { search, state, district } = req.query;
    let query = { status: "ACTIVE" };

    if (search) {
      query.$or = [
        { collegeName: { $regex: search, $options: "i" } },
        { collegeCode: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }

    if (state) query.state = { $regex: state, $options: "i" };
    if (district) query.district = { $regex: district, $options: "i" };

    const colleges = await College.find(query).sort({ collegeName: 1 });
    res.json({ success: true, count: colleges.length, data: colleges });
  } catch (err) {
    next(err);
  }
};

// @desc Get single college
// @route GET /api/colleges/:id
const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: "College record not found" });
    res.json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

// @desc Create new college (Super Admin)
// @route POST /api/colleges
const createCollege = async (req, res, next) => {
  try {
    const { collegeCode, collegeName, university, state, district, address, location } = req.body;
    if (!collegeCode || !collegeName) {
      return res.status(400).json({ success: false, message: "Please provide collegeCode and collegeName" });
    }

    const existing = await College.findOne({
      $or: [{ collegeCode }, { collegeName }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "College with this code or name already exists" });
    }

    const collegeId = `COL-${collegeCode.toUpperCase()}`;
    const college = await College.create({
      collegeId,
      collegeCode: collegeCode.toUpperCase(),
      collegeName,
      state: state || "Tamil Nadu",
      district: district || "Chennai",
      university: university || "Anna University",
      address: address || "",
      location: location || "Main Campus",
    });

    res.status(201).json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

// @desc Onboard College Admin account (Super Admin)
// @route POST /api/colleges/:id/admin
const createCollegeAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and Email are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User email already registered" });
    }

    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password || crypto.randomBytes(16).toString("hex"),
      role: "college_admin",
      institutionId: college.collegeName,
      collegeRef: college._id,
      emailVerified: true,
      invitationToken,
      invitationTokenExpires,
      status: "ACTIVE",
    });

    const emailResult = await emailService.sendAdminInvitationEmail(cleanEmail, college.collegeName, invitationToken);

    res.status(201).json({
      success: true,
      message: emailResult.configured
        ? `College Admin onboarded! Invitation email sent to ${cleanEmail}`
        : `College Admin onboarded! Email service unconfigured. Setup link generated.`,
      emailConfigured: emailResult.configured,
      setupLink: emailResult.setupLink || null,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  createCollege,
  createCollegeAdmin,
};
