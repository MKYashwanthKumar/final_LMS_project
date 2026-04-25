const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const profileUpdateRequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none"
    },
    payload: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      department: { type: String, default: "" },
      studentId: { type: String, default: "" },
      facultyId: { type: String, default: "" },
      year: { type: String, default: "" },
      password: { type: String, default: "" }
    },
    requestedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "librarian", "faculty", "student"],
      required: true
    },
    department: {
      type: String,
      default: ""
    },
    studentId: {
      type: String,
      default: ""
    },
    year: {
      type: String,
      default: ""
    },
    facultyId: {
      type: String,
      default: ""
    },
    accessStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: {
      type: String,
      default: ""
    },
    approvedAt: {
      type: Date,
      default: null
    },
    profileUpdateRequest: {
      type: profileUpdateRequestSchema,
      default: () => ({
        status: "none",
        payload: {},
        requestedAt: null,
        reviewedAt: null,
        reviewedBy: ""
      })
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);