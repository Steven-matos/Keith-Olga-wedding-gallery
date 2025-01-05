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

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum file size in bytes (10MB)
    files: 10, // Maximum number of files allowed
  },
});

// Route: Upload File
router.post("/", upload.array("images", 10), async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No Photos uploaded.");
  }

  const photos = [];

  for (const file of req.files) {
    const photo = new Photo({
      uploaderName: req.body.uploaderName,
      caption: req.body.caption,
      photoURL: `/uploads/${file.filename}`,
    });
    photos.push(photo);
  }

  try {
    await Photo.insertMany(photos);
    res.status(200).json({
      message: "Photos uploaded and metadata saved successfully",
      photos,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
