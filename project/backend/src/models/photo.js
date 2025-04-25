const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  uploaderName: { type: String, required: true },
  caption: String,
  photoURL: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  originalSize: { type: Number, required: true }, // Size in bytes
  processedSize: { type: Number, required: true }, // Size in bytes after optimization
  format: { type: String, required: true }, // Final format (webp, jpeg, png)
  originalFormat: { type: String, required: true }, // Original format
  deviceInfo: {
    make: String,
    model: String,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
