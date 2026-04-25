const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Recommendation = require("../models/Recommendation");
const seedData = require("../seed/seedData");

async function getOverviewReport(req, res, next) {
  try {
    const users = await User.find();
    const books = await Book.find();
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(10);

    const totalUsers = users.length;
    const approvedUsers = users.filter((u) => (u.accessStatus || "approved") === "approved").length;
    const pendingUsers = users.filter((u) => (u.accessStatus || "approved") === "pending").length;

    const totalBooks = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
    const totalTitles = books.length;
    const totalAvailable = books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);

    const admins = users.filter((u) => u.role === "admin").length;
    const librarians = users.filter((u) => u.role === "librarian").length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const students = users.filter((u) => u.role === "student").length;

    const activeIssues = transactions.filter((t) => t.status === "active").length;
    const overdue = transactions.filter((t) => t.status === "overdue").length;
    const returned = transactions.filter((t) => t.status === "returned").length;
    const totalFines = transactions.reduce((sum, t) => sum + (t.fine || 0), 0);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        approvedUsers,
        pendingUsers,
        totalBooks,
        totalTitles,
        totalAvailable,
        roleDistribution: {
          admins,
          librarians,
          faculty,
          students
        },
        transactions: {
          activeIssues,
          overdue,
          returned
        },
        totalFines,
        recentTransactions: transactions
      }
    });
  } catch (error) {
    next(error);
  }
}

async function exportSystemData(req, res, next) {
  try {
    const [users, books, transactions, recommendations] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      Book.find().sort({ createdAt: -1 }),
      Transaction.find().sort({ createdAt: -1 }),
      Recommendation.find().sort({ createdAt: -1 })
    ]);

    const overview = {
      totalUsers: users.length,
      approvedUsers: users.filter((u) => (u.accessStatus || "approved") === "approved").length,
      pendingUsers: users.filter((u) => (u.accessStatus || "approved") === "pending").length,
      totalBooks: books.reduce((sum, book) => sum + (book.totalCopies || 0), 0),
      totalTitles: books.length,
      totalAvailable: books.reduce((sum, book) => sum + (book.availableCopies || 0), 0),
      totalFines: transactions.reduce((sum, item) => sum + (item.fine || 0), 0)
    };

    res.status(200).json({
      success: true,
      exportedAt: new Date().toISOString(),
      overview,
      users,
      books,
      transactions,
      recommendations
    });
  } catch (error) {
    next(error);
  }
}

async function resetSystemData(req, res, next) {
  try {
    await Promise.all([
      Transaction.deleteMany({}),
      Recommendation.deleteMany({}),
      Book.deleteMany({}),
      User.deleteMany({})
    ]);

    await seedData();

    res.status(200).json({
      success: true,
      message: "System reset to default seeded state successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverviewReport,
  exportSystemData,
  resetSystemData
};