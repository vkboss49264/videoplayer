const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

const VideoSchema = new mongoose.Schema({
    title: String,
    videoId: String
});
const Video = mongoose.model("Video", VideoSchema);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

app.post("/api/videos", async (req, res) => {
    try {
        const { title, videoId } = req.body;
        if (!title || !videoId) {
            return res.status(400).json({ message: "Title and videoId are required" });
        }

        const newVideo = new Video({ title, videoId });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

app.get("/api/videos", async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
