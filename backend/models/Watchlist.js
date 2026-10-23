const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true, uppercase: true, trim: true, maxlength: 20 },
}, { timestamps: true });

watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);
