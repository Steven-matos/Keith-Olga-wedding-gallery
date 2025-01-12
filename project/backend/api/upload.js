const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const Photo = require("../models/photo.js");

const router = express.Router();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 Storage Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 10,
  },
});

// Route: Upload Files to S3
router.post("/", upload.array("images", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No photos uploaded.");
  }

  try {
    const uploadedPhotos = [];
    for (const file of req.files) {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read", // Makes the file publicly accessible
      };

      const uploadResult = await s3.upload(params).promise();

      // Save photo metadata in the database
      const photo = new Photo({
        uploaderName: req.body.uploaderName,
        caption: req.body.caption,
        photoURL: uploadResult.Location, // URL of the uploaded file
      });
      uploadedPhotos.push(photo);
    }

    await Photo.insertMany(uploadedPhotos);

    res.status(200).json({
      message: "Photos uploaded to S3 and metadata saved successfully",
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).json({ error: "Error uploading photos" });
  }
});

module.exports = router;
