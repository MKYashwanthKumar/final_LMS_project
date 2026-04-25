const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
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
    bookTitle: {
      type: String,
      required: true
    },
    bookIsbn: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Reservation", reservationSchema);