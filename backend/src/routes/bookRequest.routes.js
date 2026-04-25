const express = require("express");
const {
  getBookRequests,
  createBookRequest
} = require("../controllers/bookRequest.controller");

const router = express.Router();

router.get("/", getBookRequests);
router.post("/", createBookRequest);

module.exports = router;