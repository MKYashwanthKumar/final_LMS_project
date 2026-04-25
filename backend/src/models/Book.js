const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      default: ""
    },
    edition: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: ""
    },
    totalCopies: {
      type: Number,
      default: 1
    },
    availableCopies: {
      type: Number,
      default: 1
    },
    issuedCopies: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.0
    },
    status: {
      type: String,
      enum: ["available", "limited", "unavailable"],
      default: "available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Book", bookSchema);