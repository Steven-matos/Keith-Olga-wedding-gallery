const express = require("express");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Photo = require("../models/photo.js");

const router = express.Router();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Route: Get All Photos
router.get("/all-photos", async (req, res) => {
  try {
    // Fetch photo metadata from the database
    const photos = await Photo.find();

    // Generate signed URLs for each photo
    const signedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const key = photo.photoURL.split("/").pop();
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        });
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          ...photo._doc,
          signedUrl,
        };
      })
    );

    res.status(200).json(signedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Error fetching photos" });
  }
});

module.exports = router;
