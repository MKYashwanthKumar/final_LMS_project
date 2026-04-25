const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    facultyName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);