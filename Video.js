const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoId: { type: String, required: true }, // Store only YouTube Video ID
});

module.exports = mongoose.model("Video", videoSchema);
