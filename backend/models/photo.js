const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  uploaderName: { type: String, required: true },
  caption: String,
  photoURL: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Photo", photoSchema);
