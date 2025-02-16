const express = require("express");
const Video = require("../models/Video");

const router = express.Router();

// Get all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
});

// Add a new video
router.post("/", async (req, res) => {
  try {
    const { title, videoId } = req.body;
    
    if (!title || !videoId) {
      return res.status(400).json({ message: "Title and Video ID are required" });
    }

    const newVideo = new Video({ title, videoId });
    await newVideo.save();
    
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ message: "Error adding video", error: error.message });
  }
});

module.exports = router;
