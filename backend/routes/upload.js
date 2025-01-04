// routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Photo = require("../models/Photo");

const router = express.Router();

// File Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route: Upload File
router.post("/", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const photo = new Photo({
    uploaderName: req.body.uploaderName,
    caption: req.body.caption,
    photoURL: `/uploads/${req.file.filename}`,
  });

  try {
    await photo.save();
    res.status(200).json({
      message: "File uploaded and metadata saved successfully",
      photo,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving photo metadata" });
  }
});

module.exports = router;
