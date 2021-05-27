const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, trim: true, required: true },
    avatar: { type: String, trim: true },
    bio: { type: String, trim: true },
    birth: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    createAt: { type: String, required: true },
    email: { type: String, trim: true, required: true },
    friend: { type: Array },
    gender: { type: String, trim: true, required: true },
    topic: { type: Array },
    userName: { type: String, trim: true, required: true },
    banStatus: { type: Boolean, default: false },
    role: { type: String, enum: ["Admin", "Member"], default: "Member" },
  },
  { collection: "User", versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
