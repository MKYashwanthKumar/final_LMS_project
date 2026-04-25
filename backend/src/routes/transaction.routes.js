const express = require("express");
const {
  getTransactions,
  issueBook,
  returnBook
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/", getTransactions);
router.post("/issue", issueBook);
router.put("/:id/return", returnBook);

module.exports = router;