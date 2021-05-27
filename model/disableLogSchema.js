const mongoose = require("mongoose");

const DisableLogSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    createAt: { type: Date, required: true },
    userId: { type: String, trim: true, required: true },
    period: { type: Number, default: 3 },
  },
  { collection: "DisableLog" }
);

module.exports = mongoose.model("DisableLog", DisableLogSchema);
