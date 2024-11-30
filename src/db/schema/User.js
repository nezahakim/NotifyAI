const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  names: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  referralCode: { type: String, unique: true },
  points: { type: Number, default: 0 },
  lastDailyBonus: { type: Date },
  referredBy: { type: String, default: null },
  usedPromoCodes: [{ type: String }],
  isPremium: { type: Boolean, default: false},
});

const User = mongoose.model("User", userSchema);

module.exports = User;