const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    index: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: /^[6-9]\d{9}$/,
  },
  phoneVerified: { type: Boolean, default: false },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user", immutable: true },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
