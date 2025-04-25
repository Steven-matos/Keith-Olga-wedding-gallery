const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const Photo = require("../models/photo.js");
const EventEmitter = require("events");

const router = express.Router();

// Create an event emitter for upload progress
const uploadProgressEmitter = new EventEmitter();

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Image processing configuration
const MAX_WIDTH = 1920; // Maximum width for resized images
const MAX_HEIGHT = 1080; // Maximum height for resized images
const QUALITY = 80; // JPEG quality (0-100)
const MOBILE_QUALITY = 75; // Slightly lower quality for mobile to reduce data usage

// Supported image formats
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Function to extract EXIF data
async function extractExifData(image) {
  try {
    const metadata = await image.metadata();
    return {
      orientation: metadata.orientation,
      device: metadata.exif?.Make || "Unknown",
      model: metadata.exif?.Model || "Unknown",
      date: metadata.exif?.DateTimeOriginal || new Date().toISOString(),
      location:
        metadata.exif?.GPSLatitude && metadata.exif?.GPSLongitude
          ? {
              latitude: metadata.exif.GPSLatitude,
              longitude: metadata.exif.GPSLongitude,
            }
          : null,
    };
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return null;
  }
}

// Function to determine best format for the image
async function determineBestFormat(image, originalMimeType) {
  const metadata = await image.metadata();

  // If image has transparency, use PNG
  if (metadata.hasAlpha) {
    return "png";
  }

  // For HEIC/HEIF, convert to WebP for better compatibility
  if (originalMimeType === "image/heic" || originalMimeType === "image/heif") {
    return "webp";
  }

  // For photos and complex images, use WebP
  if (metadata.channels === 3 || metadata.channels === 4) {
    return "webp";
  }

  // Default to JPEG for other cases
  return "jpeg";
}

// Function to process and optimize image
async function processImage(buffer, originalMimeType) {
  try {
    const image = sharp(buffer);

    // Get image metadata and EXIF data
    const metadata = await image.metadata();
    const exifData = await extractExifData(image);

    // Determine best format
    const targetFormat = await determineBestFormat(image, originalMimeType);

    // Resize if needed while maintaining aspect ratio
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      image.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Apply orientation correction if needed
    if (exifData?.orientation && exifData.orientation > 1) {
      image.rotate(); // Auto-rotate based on EXIF orientation
    }

    // Process based on format
    let processedBuffer;
    switch (targetFormat) {
      case "webp":
        processedBuffer = await image
          .webp({
            quality: MOBILE_QUALITY,
            effort: 4,
          })
          .toBuffer();
        break;

      case "png":
        processedBuffer = await image
          .png({
            compressionLevel: 6,
            palette: true,
          })
          .toBuffer();
        break;

      case "jpeg":
      default:
        processedBuffer = await image
          .jpeg({
            quality: MOBILE_QUALITY,
            mozjpeg: true,
            chromaSubsampling: "4:2:0",
          })
          .toBuffer();
    }

    return {
      buffer: processedBuffer,
      format: targetFormat,
      contentType: `image/${targetFormat}`,
      exifData: exifData,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

// Multer S3 Storage Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    // Accept only supported image files
    if (SUPPORTED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type. Supported types: ${SUPPORTED_FORMATS.join(
            ", "
          )}`
        ),
        false
      );
    }
  },
});

// Route: Upload Files to S3
router.post("/", upload.array("images", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No photos uploaded." });
  }

  try {
    const uploadedPhotos = [];
    const totalFiles = req.files.length;
    let completedFiles = 0;

    for (const file of req.files) {
      // Process and optimize the image
      const processed = await processImage(file.buffer, file.mimetype);

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}-${file.originalname}.${processed.format}`,
        Body: processed.buffer,
        ContentType: processed.contentType,
        ACL: "public-read",
      };

      // Upload to S3 with progress tracking
      const command = new PutObjectCommand(params);
      const uploadResult = await s3Client.send(command);

      // Save photo metadata in the database
      const photo = new Photo({
        uploaderName: req.body.uploaderName,
        caption: req.body.caption,
        photoURL: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
        originalSize: file.size,
        processedSize: processed.buffer.length,
        format: processed.format,
        originalFormat: file.mimetype.split("/")[1],
        deviceInfo: processed.exifData?.device
          ? {
              make: processed.exifData.device,
              model: processed.exifData.model,
            }
          : null,
        location: processed.exifData?.location,
        uploadDate: new Date(processed.exifData?.date || Date.now()),
      });
      uploadedPhotos.push(photo);
      completedFiles++;
    }

    await Photo.insertMany(uploadedPhotos);

    res.status(200).json({
      message: "Photos uploaded and optimized successfully",
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).json({
      error: "Error uploading photos",
      details: error.message,
    });
  }
});

// Route: Get upload progress
router.get("/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const progressHandler = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  uploadProgressEmitter.on("progress", progressHandler);

  req.on("close", () => {
    uploadProgressEmitter.removeListener("progress", progressHandler);
  });
});

module.exports = router;
