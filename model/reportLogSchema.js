const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ReportLogSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, default: new ObjectId() },
    createAt: { type: Date, required: true, default: new Date() },
    reporter: { type: String, trim: true, required: true },
    reported: { type: String, trim: true, required: true },
    reportedType: { type: String, enum: ["Question", "User", "Comment"] },
    reportDetail: { type: Array },
  },
  { collection: "ReportLog" }
);

module.exports = mongoose.model("ReportLog", ReportLogSchema);
