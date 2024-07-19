const express = require("express");
const auth = require("../middleware/auth");
const Note = require("../models/Note");
const router = express.Router();

// Add a new note
router.post("/", auth, async (req, res) => {
  const { title, content, tags, color } = req.body;
  try {
    const note = new Note({
      title,
      content,
      tags,
      color,
      userId: req.user.userId,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const notes = await Note.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive search
        { content: { $regex: query, $options: "i" } }, // Searching in content too
      ],
    });
    res.json(notes);
  } catch (error) {
    console.error("Error searching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all notes
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId, deletedAt: null });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a note
router.put("/:id", auth, async (req, res) => {
  const { title, content, tags, color, archived } = req.body;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, content, tags, color, archived },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a note (move to trash)
router.delete("/:id", auth, async (req, res) => {
  try {
    await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { deletedAt: new Date() }
    );
    res.json({ message: "Note moved to trash successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all archived notes
router.get("/archive", auth, async (req, res) => {
  try {
    const archivedNotes = await Note.find({
      userId: req.user.userId,
      archived: true,
      deletedAt: null,
    });
    res.json(archivedNotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unarchive a note
router.put("/unarchive/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { archived: false },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all trashed notes
router.get("/trash", auth, async (req, res) => {
  try {
    const trashedNotes = await Note.find({
      userId: req.user.userId,
      deletedAt: { $ne: null },
    });
    res.json(trashedNotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete note permanently
router.delete("/:id", auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    res.json({ message: "Note deleted permanently" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete note permanently
router.delete("/permanent/:id", auth, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted permanently" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
const getNotesByTag = async (req, res) => {
  const tag = req.params.tag;
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      tags: { $in: [tag] },
      deletedAt: null,
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.get("/tags", async (req, res) => {
  const { tags } = req.query;
  try {
    const notes = await Note.find({ tags: { $all: tags.split(",") } });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching tagged notes:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
