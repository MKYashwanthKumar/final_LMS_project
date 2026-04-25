const User = require("../models/User");

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildProfileRequestSummary(user) {
  const request = user.profileUpdateRequest || {};
  const payload = request.payload || {};

  return {
    status: request.status || "none",
    requestedAt: request.requestedAt || null,
    reviewedAt: request.reviewedAt || null,
    reviewedBy: request.reviewedBy || "",
    preview: {
      name: payload.name || "",
      email: payload.email || "",
      department: payload.department || "",
      studentId: payload.studentId || "",
      facultyId: payload.facultyId || "",
      year: payload.year || ""
    },
    hasPasswordChange: Boolean(payload.password)
  };
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    department: user.department || "",
    studentId: user.studentId || "",
    year: user.year || "",
    facultyId: user.facultyId || "",
    accessStatus: user.accessStatus || "approved",
    approvedBy: user.approvedBy || "",
    approvedAt: user.approvedAt || null,
    profileUpdateRequest: buildProfileRequestSummary(user)
  };
}

async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password and role are required"
      });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(username.trim())}$`, "i") },
      role
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username, password, or role"
      });
    }

    const accessStatus = user.accessStatus || "approved";

    if (accessStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval. Please try again later."
      });
    }

    if (accessStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your registration request was rejected by admin."
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username, password, or role"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      username,
      password,
      role,
      department,
      studentId,
      year,
      facultyId
    } = req.body;

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, username, password and role are required"
      });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(username.trim())}$`, "i") }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    const existingEmail = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password,
      role,
      department: department || "",
      studentId: studentId || "",
      year: year || "",
      facultyId: facultyId || "",
      accessStatus: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted. Wait for admin approval before login.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register
};