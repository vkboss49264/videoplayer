require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config");
const videoRoutes = require("./routes/videoRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows JSON request bodies

// Database connection
connectDB();

// Routes
app.use("/api/videos", videoRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
