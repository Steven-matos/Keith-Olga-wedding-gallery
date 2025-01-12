const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://tridentinnovationsinvestments:ppso6Bw02iwI6usl@kowedding.9ysrd.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const uploadRoutes = require("./upload");
const photoRoutes = require("./photo");

app.use("/api/upload", uploadRoutes);
app.use("/api/photo", photoRoutes);

module.exports = app;
