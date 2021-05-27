const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    createAt: { type: Date, required: true },
    owner: { type: String, trim: true, required: true },
    question: { type: String, trim: true, required: true },
    topic: { type: Array, required: true },
    commentCount: { type: Number, default: 0 },
  },
  { collection: "Question" }
);

module.exports = mongoose.model("Question", QuestionSchema);
