const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    requesterName: {
      type: String,
      required: true
    },
    requesterRole: {
      type: String,
      required: true
    },
    requesterCode: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: ""
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

module.exports = mongoose.model("BookRequest", bookRequestSchema);