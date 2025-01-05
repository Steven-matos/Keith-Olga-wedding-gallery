// routes/photo.js
const express = require("express");
const Photo = require("../models/Photo");

const router = express.Router();

// Route: Get All Photos
router.get("/all-photos", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching photos" });
  }
});

module.exports = router;
