const express = require("express");
const {
  getOverviewReport,
  exportSystemData,
  resetSystemData
} = require("../controllers/report.controller");

const router = express.Router();

router.get("/overview", getOverviewReport);
router.get("/export", exportSystemData);
router.post("/reset", resetSystemData);

module.exports = router;