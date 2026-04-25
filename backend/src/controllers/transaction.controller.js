const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Book = require("../models/Book");

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 5);

const syncOverdueTransactions = async () => {
  const now = new Date();

  const activeTransactions = await Transaction.find({
    status: "active",
    dueDate: { $lt: now }
  });

  for (const tx of activeTransactions) {
    const lateDays = Math.ceil((now - new Date(tx.dueDate)) / (1000 * 60 * 60 * 24));
    tx.status = "overdue";
    tx.fine = Math.max(0, lateDays * FINE_PER_DAY);
    await tx.save();
  }
};

const normalizeBookAvailability = (book) => {
  book.availableCopies = Math.max(0, Number(book.totalCopies || 0) - Number(book.issuedCopies || 0));

  if (book.availableCopies <= 0) {
    book.status = "out-of-stock";
  } else if (Number(book.issuedCopies || 0) > 0) {
    book.status = "limited";
  } else {
    book.status = "available";
  }
};

async function getTransactions(req, res, next) {
  try {
    await syncOverdueTransactions();

    const transactions = await Transaction.find().sort({ issueDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
}

async function issueBook(req, res, next) {
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

    if ((user.accessStatus || "approved") !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This user is not approved for borrowing books"
      });
    }

    if (Number(book.availableCopies || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is out of stock"
      });
    }

    const existingActive = await Transaction.findOne({
      user: user._id,
      book: book._id,
      status: { $in: ["active", "overdue"] }
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: "This user already has this book issued"
      });
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);

    if (user.role === "faculty") {
      dueDate.setDate(dueDate.getDate() + 30);
    } else {
      dueDate.setDate(dueDate.getDate() + 15);
    }

    const transaction = await Transaction.create({
      user: user._id,
      book: book._id,
      borrowerName: user.name,
      borrowerRole: user.role,
      borrowerCode: user.studentId || user.facultyId || user.username,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      issueDate,
      dueDate,
      status: "active",
      fine: 0
    });

    book.issuedCopies = Number(book.issuedCopies || 0) + 1;
    normalizeBookAvailability(book);
    await book.save();

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      transaction
    });
  } catch (error) {
    next(error);
  }
}

async function returnBook(req, res, next) {
  try {
    await syncOverdueTransactions();

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    if (transaction.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "This book is already returned"
      });
    }

    const book = await Book.findById(transaction.book);

    const returnDate = new Date();
    const lateDays = Math.max(
      0,
      Math.ceil((returnDate - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))
    );
    const fine = lateDays * FINE_PER_DAY;

    transaction.returnDate = returnDate;
    transaction.status = "returned";
    transaction.fine = fine;

    await transaction.save();

    if (book) {
      book.issuedCopies = Math.max(0, Number(book.issuedCopies || 0) - 1);
      normalizeBookAvailability(book);
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      transaction
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  issueBook,
  returnBook
};