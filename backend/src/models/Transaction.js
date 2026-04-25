const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    borrowerName: {
      type: String,
      required: true
    },
    borrowerRole: {
      type: String,
      enum: ["admin", "librarian", "faculty", "student"],
      required: true
    },
    borrowerCode: {
      type: String,
      default: ""
    },
    bookTitle: {
      type: String,
      required: true
    },
    bookIsbn: {
      type: String,
      default: ""
    },
    issueDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["active", "overdue", "returned"],
      default: "active"
    },
    fine: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);