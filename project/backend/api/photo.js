const express = require("express");
const AWS = require("aws-sdk");
const Photo = require("../models/Photo");

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Route: Get All Photos
router.get("/all-photos", async (req, res) => {
  try {
    // Fetch photo metadata from the database
    const photos = await Photo.find();

    // Generate signed URLs for each photo
    const signedPhotos = photos.map((photo) => {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: photo.photoURL,
        Expires: 60 * 60,
      });

      return {
        ...photo._doc, // Spread the photo document to preserve other fields
        signedUrl, // Add the signed URL
      };
    });

    res.status(200).json(signedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
});

module.exports = router;
