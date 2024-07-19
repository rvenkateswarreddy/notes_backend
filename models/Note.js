// models/Note.js

const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  color: { type: String, default: "#ffffff" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  archived: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Note", NoteSchema);
