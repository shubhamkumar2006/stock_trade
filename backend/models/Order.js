const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  symbol: { type: String, required: true, uppercase: true, trim: true, maxlength: 20 },
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  status: { type: String, enum: ["simulated"], default: "simulated", immutable: true },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
