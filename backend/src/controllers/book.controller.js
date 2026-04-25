const Book = require("../models/Book");
const Transaction = require("../models/Transaction");

const normalizeBookState = (book) => {
  const total = Number(book.totalCopies || 0);
  const issued = Number(book.issuedCopies || 0);
  const available = Math.max(0, total - issued);

  book.totalCopies = total;
  book.issuedCopies = issued;
  book.availableCopies = available;

  if (available <= 0) {
    book.status = "out-of-stock";
  } else if (issued > 0) {
    book.status = "limited";
  } else {
    book.status = "available";
  }

  return book;
};

async function getBooks(req, res, next) {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      books
    });
  } catch (error) {
    next(error);
  }
}

async function createBook(req, res, next) {
  try {
    const {
      title,
      author,
      isbn,
      category,
      edition,
      subject,
      totalCopies,
      rating
    } = req.body;

    if (!title || !author || !isbn || !totalCopies) {
      return res.status(400).json({
        success: false,
        message: "Title, author, ISBN and total copies are required"
      });
    }

    const existing = await Book.findOne({ isbn: isbn.trim() });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists"
      });
    }

    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category: category?.trim() || "General",
      edition: edition?.trim() || "",
      subject: subject?.trim() || "",
      totalCopies: Number(totalCopies),
      issuedCopies: 0,
      availableCopies: Number(totalCopies),
      rating: rating ? Number(rating) : 0,
      status: "available"
    });

    normalizeBookState(book);
    await book.save();

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book
    });
  } catch (error) {
    next(error);
  }
}

async function updateBook(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    const {
      title,
      author,
      isbn,
      category,
      edition,
      subject,
      totalCopies,
      rating
    } = req.body;

    if (isbn && isbn.trim() !== book.isbn) {
      const existing = await Book.findOne({ isbn: isbn.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists"
        });
      }
    }

    const nextTotalCopies =
      totalCopies !== undefined ? Number(totalCopies) : Number(book.totalCopies || 0);

    if (nextTotalCopies < Number(book.issuedCopies || 0)) {
      return res.status(400).json({
        success: false,
        message: "Total copies cannot be less than issued copies"
      });
    }

    book.title = title !== undefined ? title.trim() : book.title;
    book.author = author !== undefined ? author.trim() : book.author;
    book.isbn = isbn !== undefined ? isbn.trim() : book.isbn;
    book.category = category !== undefined ? category.trim() : book.category;
    book.edition = edition !== undefined ? edition.trim() : book.edition;
    book.subject = subject !== undefined ? subject.trim() : book.subject;
    book.totalCopies = nextTotalCopies;
    book.rating = rating !== undefined ? Number(rating) : book.rating;

    normalizeBookState(book);
    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    const activeCount = await Transaction.countDocuments({
      book: book._id,
      status: { $in: ["active", "overdue"] }
    });

    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete this book while it is currently issued"
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook
};