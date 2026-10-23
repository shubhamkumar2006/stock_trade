const mongoose = require("mongoose");

const phoneVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  attempts: { type: Number, required: true, default: 0, min: 0, max: 5 },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

module.exports = mongoose.models.PhoneVerification ||
  mongoose.model("PhoneVerification", phoneVerificationSchema);
