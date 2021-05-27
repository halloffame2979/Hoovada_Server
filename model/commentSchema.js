const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    answer: { type: String, trim: true, required: true },
    createAt: { type: Date, required: true },
    like: { type: Array, default: [] },
    dislike: { type: Array, default: [] },
    initVote: { type: Number, default: 0 },
    owner: { type: String, trim: true, required: true },
    question: { type: String, trim: true, required: true },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
  },
  { collection: "Comment" }
);

module.exports = mongoose.model("Comment", CommentSchema);
