const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  approveUser,
  rejectUser,
  deleteUser,
  submitProfileUpdateRequest,
  approveProfileUpdateRequest,
  rejectProfileUpdateRequest
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/:id/approve", approveUser);
router.put("/:id/reject", rejectUser);
router.post("/:id/profile-request", submitProfileUpdateRequest);
router.put("/:id/profile-request/approve", approveProfileUpdateRequest);
router.put("/:id/profile-request/reject", rejectProfileUpdateRequest);
router.delete("/:id", deleteUser);

module.exports = router;