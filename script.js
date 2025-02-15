document.addEventListener("DOMContentLoaded", () => {
    fetchVideos(); // Fetch and display videos when the page loads

    // Add video form submission
    document.getElementById("videoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const title = document.getElementById("title").value;
        const videoId = document.getElementById("videoId").value;

        if (!title || !videoId) {
            alert("Please enter a title and video ID.");
            return;
        }

        const response = await fetch("http://localhost:5000/api/videos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, videoId }),
        });

        if (response.ok) {
            fetchVideos(); // Refresh video list
            document.getElementById("videoForm").reset();
        } else {
            alert("Failed to add video.");
        }
    });
});

let players = {}; // Store video players globally
let currentVideoId = null; // Track the currently focused video

// Load YouTube API
function loadYouTubeAPI() {
    let tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Initialize YouTube Players
function onYouTubeIframeAPIReady() {
    document.querySelectorAll(".video-iframe").forEach(iframe => {
        let videoId = iframe.getAttribute("data-videoid");
        players[videoId] = new YT.Player(iframe, {
            events: {
                "onReady": (event) => {
                    console.log(`Player for ${videoId} is ready`);
                },
            },
        });
    });
}

// Fetch and Display Videos
async function fetchVideos() {
    const response = await fetch("http://localhost:5000/api/videos");
    const videos = await response.json();

    document.getElementById("video-container").innerHTML = videos
        .map(video => `
        <div class="video-card">
            <h3>${video.title}</h3>
            <div style="position: relative; width: 100%; margin: auto;">
                <div class="video-thumbnail" id="thumbnail-${video.videoId}" onclick="playVideo('${video.videoId}')">
                    <img src="https://img.youtube.com/vi/${video.videoId}/0.jpg" alt="Video Thumbnail" style="width: 100%; height: auto;">
                    <div class="play-button-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 50px;">▶</div>
                </div>
                <div class="video-player" id="video-player-${video.videoId}" style="display: none;">
                    <iframe 
                        class="video-iframe"
                        data-videoid="${video.videoId}"
                        id="video-${video.videoId}"
                        src="https://www.youtube-nocookie.com/embed/${video.videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                        style="pointer-events: none;"
                        sandbox="allow-scripts allow-same-origin">
                    </iframe>
                </div>
                <div class="controls">
                    <button onclick="playVideo('${video.videoId}')">▶ Play</button>
                    <button onclick="pauseVideo('${video.videoId}')">⏸ Pause</button>
                    <button onclick="seekVideo('${video.videoId}', -5)">⏪ Back 5s</button>
                    <button onclick="seekVideo('${video.videoId}', 5)">⏩ Forward 5s</button>
                    <button onclick="fullscreenVideo('${video.videoId}')">⛶ Fullscreen</button>
                    <label for="speed-${video.videoId}">Speed: </label>
                    <select id="speed-${video.videoId}" onchange="changeSpeed('${video.videoId}')">
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="1" selected>1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
            </div>
        </div>`)
        .join("");

    loadYouTubeAPI(); // Load API after videos are added

    // Set the first video as the default focused video
    if (videos.length > 0) {
        currentVideoId = videos[0].videoId;
    }
}

// Play Video (replace thumbnail with video)
function playVideo(videoId) {
    const thumbnail = document.getElementById(`thumbnail-${videoId}`);
    const videoPlayer = document.getElementById(`video-player-${videoId}`);

    // Hide the thumbnail and show the video iframe
    thumbnail.style.display = 'none';
    videoPlayer.style.display = 'block';

    if (players[videoId]) players[videoId].playVideo();
    currentVideoId = videoId; // Update focused video
}

// Pause Video
function pauseVideo(videoId) {
    if (players[videoId]) players[videoId].pauseVideo();
}

// Seek Video (Forward/Backward)
function seekVideo(videoId, seconds) {
    if (players[videoId]) {
        let currentTime = players[videoId].getCurrentTime();
        players[videoId].seekTo(currentTime + seconds, true);
    }
}

// Fullscreen Video
function fullscreenVideo(videoId) {
    const iframe = document.getElementById(`video-${videoId}`);
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
}

// Change Playback Speed
function changeSpeed(videoId) {
    const speed = document.getElementById(`speed-${videoId}`).value;
    if (players[videoId]) {
        players[videoId].setPlaybackRate(parseFloat(speed));
    }
}

// 🎮 Handle Keyboard Shortcuts 🎮
document.addEventListener("keydown", (event) => {
    if (!currentVideoId) return;

    switch (event.key) {
        case " ": // Spacebar (Play/Pause)
            event.preventDefault(); // Prevent page scrolling
            let state = players[currentVideoId].getPlayerState();
            if (state === 1) pauseVideo(currentVideoId);
            else playVideo(currentVideoId);
            break;

        case "f": // F Key (Fullscreen/Exit Fullscreen)
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                fullscreenVideo(currentVideoId);
            }
            break;

        case "ArrowRight": // Right Arrow (Forward 5s)
            seekVideo(currentVideoId, 5);
            break;

        case "ArrowLeft": // Left Arrow (Backward 5s)
            seekVideo(currentVideoId, -5);
            break;

        default:
            break;
    }
});
