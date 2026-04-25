const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Book = require("../models/Book");

async function getReservations(req, res, next) {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations
    });
  } catch (error) {
    next(error);
  }
}

async function createReservation(req, res, next) {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: "User and book are required"
      });
    }

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    if (!["faculty", "student"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty and students can request books"
      });
    }

    if ((user.accessStatus || "approved") !== "approved") {
      return res.status(400).json({
        success: false,
        message: "User is not approved"
      });
    }

    if (Number(book.availableCopies || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: "This book is currently not available"
      });
    }

    const existing = await Reservation.findOne({
      user: user._id,
      book: book._id,
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already requested this book"
      });
    }

    const reservation = await Reservation.create({
      user: user._id,
      book: book._id,
      requesterName: user.name,
      requesterRole: user.role,
      requesterCode: user.studentId || user.facultyId || user.username,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message:
        user.role === "faculty"
          ? "Book reservation request sent to librarian"
          : "Book issue request sent to librarian",
      reservation
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReservations,
  createReservation
};