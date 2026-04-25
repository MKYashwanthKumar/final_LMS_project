const User = require("../models/User");

function sanitizeUser(user) {
  const request = user.profileUpdateRequest || {};
  const payload = request.payload || {};

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
    createdAt: user.createdAt,
    profileUpdateRequest: {
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
    }
  };
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const sanitized = users.map(sanitizeUser).sort((a, b) => {
      const aPendingAccess = a.accessStatus === "pending" ? 1 : 0;
      const bPendingAccess = b.accessStatus === "pending" ? 1 : 0;
      const aPendingProfile = a.profileUpdateRequest?.status === "pending" ? 1 : 0;
      const bPendingProfile = b.profileUpdateRequest?.status === "pending" ? 1 : 0;

      if (aPendingAccess !== bPendingAccess) return bPendingAccess - aPendingAccess;
      if (aPendingProfile !== bPendingProfile) return bPendingProfile - aPendingProfile;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      users: sanitized
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
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
      facultyId,
      accessStatus
    } = req.body;

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, username, password and role are required"
      });
    }

    const usernameExists = await User.findOne({
      username: username.trim()
    });

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    const emailExists = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const statusValue = ["pending", "approved", "rejected"].includes(accessStatus)
      ? accessStatus
      : "approved";

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
      accessStatus: statusValue,
      approvedBy: statusValue === "approved" ? "Admin" : "",
      approvedAt: statusValue === "approved" ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const {
      name,
      email,
      username,
      password,
      role,
      department,
      studentId,
      year,
      facultyId,
      accessStatus,
      approvedBy
    } = req.body;

    if (email && email.trim().toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    if (username && username.trim() !== user.username) {
      const usernameExists = await User.findOne({ username: username.trim() });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
    }

    user.name = name ?? user.name;
    user.email = email ? email.trim().toLowerCase() : user.email;
    user.username = username ? username.trim() : user.username;
    user.role = role ?? user.role;
    user.department = department ?? user.department;
    user.studentId = studentId ?? user.studentId;
    user.year = year ?? user.year;
    user.facultyId = facultyId ?? user.facultyId;

    if (password && password.trim()) {
      user.password = password.trim();
    }

    if (accessStatus && ["pending", "approved", "rejected"].includes(accessStatus)) {
      user.accessStatus = accessStatus;

      if (accessStatus === "approved") {
        user.approvedBy = approvedBy || "Admin";
        user.approvedAt = new Date();
      }

      if (accessStatus === "pending") {
        user.approvedBy = "";
        user.approvedAt = null;
      }

      if (accessStatus === "rejected") {
        user.approvedBy = approvedBy || "Admin";
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function approveUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.accessStatus = "approved";
    user.approvedBy = req.body.approvedBy || "Admin";
    user.approvedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function rejectUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.accessStatus = "rejected";
    user.approvedBy = req.body.approvedBy || "Admin";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User rejected successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

async function submitProfileUpdateRequest(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.profileUpdateRequest?.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "A profile update request is already pending"
      });
    }

    const {
      name,
      email,
      department,
      studentId,
      facultyId,
      year,
      password
    } = req.body;

    const payload = {};

    if (name && name.trim() && name.trim() !== user.name) payload.name = name.trim();
    if (email && email.trim() && email.trim().toLowerCase() !== user.email) payload.email = email.trim().toLowerCase();
    if (department !== undefined && department.trim() !== user.department) payload.department = department.trim();
    if (studentId !== undefined && studentId.trim() !== user.studentId) payload.studentId = studentId.trim();
    if (facultyId !== undefined && facultyId.trim() !== user.facultyId) payload.facultyId = facultyId.trim();
    if (year !== undefined && year.trim() !== user.year) payload.year = year.trim();

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }
      payload.password = password.trim();
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile changes detected"
      });
    }

    if (payload.email) {
      const existingEmail = await User.findOne({
        email: payload.email,
        _id: { $ne: user._id }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    user.profileUpdateRequest = {
      status: "pending",
      payload,
      requestedAt: new Date(),
      reviewedAt: null,
      reviewedBy: ""
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile update request sent to admin",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function approveProfileUpdateRequest(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const request = user.profileUpdateRequest || {};

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending profile update request found"
      });
    }

    const payload = request.payload || {};

    if (payload.email && payload.email !== user.email) {
      const existingEmail = await User.findOne({
        email: payload.email,
        _id: { $ne: user._id }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Requested email already exists"
        });
      }
    }

    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.department !== undefined) user.department = payload.department;
    if (payload.studentId !== undefined) user.studentId = payload.studentId;
    if (payload.facultyId !== undefined) user.facultyId = payload.facultyId;
    if (payload.year !== undefined) user.year = payload.year;
    if (payload.password) user.password = payload.password;

    user.profileUpdateRequest = {
      status: "approved",
      payload: {},
      requestedAt: request.requestedAt || null,
      reviewedAt: new Date(),
      reviewedBy: req.body.reviewedBy || "Admin"
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile update request approved",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function rejectProfileUpdateRequest(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const request = user.profileUpdateRequest || {};

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending profile update request found"
      });
    }

    user.profileUpdateRequest = {
      status: "rejected",
      payload: request.payload || {},
      requestedAt: request.requestedAt || null,
      reviewedAt: new Date(),
      reviewedBy: req.body.reviewedBy || "Admin"
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile update request rejected",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  approveUser,
  rejectUser,
  deleteUser,
  submitProfileUpdateRequest,
  approveProfileUpdateRequest,
  rejectProfileUpdateRequest
};