const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    createAt: { type: String, required: true },
    createBy: { type: String, required: true, trim: true },
  },
  { collection: "Admin" }
);

module.exports = mongoose.model("Admin", AdminSchema);