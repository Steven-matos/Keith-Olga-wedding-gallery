const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Connected to the server" });
});

const uploadRoutes = require("./upload");
const photoRoutes = require("./photo");

app.use("/api/upload", uploadRoutes);
app.use("/api/photo", photoRoutes);

module.exports = app;
