const mongoose = require("mongoose");
const photoSchema = new mongoose.Schema({
  uploaderName: { type: String, required: true },
  caption: String,
  photoURL: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

photoSchema.statics.insertMany = async (photos) => {
  return await this.insertMany(photos);
};

module.exports = mongoose.model("Photo", photoSchema);
