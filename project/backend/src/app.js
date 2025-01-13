const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.status(200).send("Connected to Server");
});

app.get("/test", (req, res) => {
  res.status(200).send("Hello from Vercel!");
});

const uploadRoutes = require("./routes/upload");
const photoRoutes = require("./routes/photo");

// Use the routes
app.use("/api/upload", uploadRoutes);
app.use("/api/photo", photoRoutes);

module.exports = app;
