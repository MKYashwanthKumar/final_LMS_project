const BookRequest = require("../models/BookRequest");
const User = require("../models/User");

async function getBookRequests(req, res, next) {
  try {
    const requests = await BookRequest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
}

async function createBookRequest(req, res, next) {
  try {
    const { userId, title, author, subject, reason } = req.body;

    if (!userId || !title || !reason) {
      return res.status(400).json({
        success: false,
        message: "User, title and reason are required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit this request"
      });
    }

    if ((user.accessStatus || "approved") !== "approved") {
      return res.status(400).json({
        success: false,
        message: "User is not approved"
      });
    }

    const request = await BookRequest.create({
      user: user._id,
      requesterName: user.name,
      requesterRole: user.role,
      requesterCode: user.studentId || user.username,
      title: title.trim(),
      author: author?.trim() || "",
      subject: subject?.trim() || "",
      reason: reason.trim(),
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "New book request sent to librarian",
      request
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookRequests,
  createBookRequest
};