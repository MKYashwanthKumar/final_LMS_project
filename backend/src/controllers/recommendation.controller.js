const Recommendation = require("../models/Recommendation");
const User = require("../models/User");

async function getRecommendations(req, res, next) {
  try {
    const recommendations = await Recommendation.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
}

async function createRecommendation(req, res, next) {
  try {
    const { facultyId, title, author, reason } = req.body;

    if (!facultyId || !title || !author || !reason) {
      return res.status(400).json({
        success: false,
        message: "Faculty, title, author and reason are required"
      });
    }

    const faculty = await User.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty user not found"
      });
    }

    const recommendation = await Recommendation.create({
      faculty: faculty._id,
      facultyName: faculty.name,
      department: faculty.department || "",
      title: title.trim(),
      author: author.trim(),
      reason: reason.trim(),
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Recommendation sent to librarian",
      recommendation
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecommendations,
  createRecommendation
};