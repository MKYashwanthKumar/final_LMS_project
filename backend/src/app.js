const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const bookRoutes = require("./routes/book.routes");
const transactionRoutes = require("./routes/transaction.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const reportRoutes = require("./routes/report.routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const reservationRoutes = require("./routes/reservation.routes");
const app = express();
const bookRequestRoutes = require("./routes/bookRequest.routes");
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;