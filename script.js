/* Global Styles */
document.addEventListener("DOMContentLoaded", () => {
    fetchVideos(); // Fetch and display videos on page load

    const videoForm = document.getElementById("videoForm");
    if (videoForm) {
        videoForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const title = document.getElementById("title").value;
            const videoUrl = document.getElementById("videoUrl").value;
            const videoId = getYouTubeVideoId(videoUrl);

            if (!title || !videoId) {
                alert("Please enter a valid title and YouTube video URL.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/videos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, videoId }),
                });

                if (response.ok) {
                    fetchVideos(); // Refresh the video list
                    videoForm.reset();
                } else {
                    alert("Failed to add video.");
                }
            } catch (error) {
                console.error("Error adding video:", error);
            }
        });
    }
});

let players = {}; // Store video players globally
let currentVideoId = null; // Track the currently focused video

// Load YouTube API
function loadYouTubeAPI() {
    if (!window.YT) {
        let tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onload = () => {
            if (typeof onYouTubeIframeAPIReady === "function") {
                onYouTubeIframeAPIReady();
            }
        };
        document.body.appendChild(tag);
    } else {
        onYouTubeIframeAPIReady();
    }
}

// Initialize YouTube Players
function onYouTubeIframeAPIReady() {
    document.querySelectorAll(".video-iframe").forEach(iframe => {
        let videoId = iframe.getAttribute("data-videoid");
        if (!players[videoId]) {
            players[videoId] = new YT.Player(iframe, {
                events: {
                    "onReady": () => console.log(`Player for ${videoId} is ready`),
                },
            });
        }
    });
}

// Fetch and Display Videos
async function fetchVideos() {
    const videoContainer = document.getElementById("video-container");
    videoContainer.innerHTML = "<p>Loading videos...</p>";

    try {
        const response = await fetch("http://localhost:5000/api/videos");
        const videos = await response.json();

        videoContainer.innerHTML = videos.map(video => `
            <div class="video-card">
                <h3>${video.title}</h3>
                <div class="video-player">
                    <iframe 
                        class="video-iframe"
                        data-videoid="${video.videoId}"
                        id="video-${video.videoId}"
                        src="https://www.youtube-nocookie.com/embed/${video.videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                        sandbox="allow-scripts allow-same-origin">
                    </iframe>
                </div>
            </div>`).join("");

        loadYouTubeAPI();
        if (videos.length > 0) {
            currentVideoId = videos[0].videoId;
        }
    } catch (error) {
        videoContainer.innerHTML = "<p>Error loading videos.</p>";
        console.error("Error fetching videos:", error);
    }
}

// Extract YouTube Video ID
function getYouTubeVideoId(url) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/(?:embed|v|e)\/))([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Keyboard Controls
document.addEventListener("keydown", (event) => {
    if (!currentVideoId || event.target.tagName === "INPUT") return;

    switch (event.key) {
        case " ":
            event.preventDefault();
            let state = players[currentVideoId]?.getPlayerState();
            if (state !== undefined) {
                state === 1 ? players[currentVideoId].pauseVideo() : players[currentVideoId].playVideo();
            }
            break;
        case "f":
            const iframe = document.getElementById(`video-${currentVideoId}`);
            if (iframe && iframe.requestFullscreen) {
                iframe.requestFullscreen();
            }
            break;
        case "ArrowRight":
            if (players[currentVideoId]) {
                players[currentVideoId].seekTo(players[currentVideoId].getCurrentTime() + 5, true);
            }
            break;
        case "ArrowLeft":
            if (players[currentVideoId]) {
                players[currentVideoId].seekTo(players[currentVideoId].getCurrentTime() - 5, true);
            }
            break;
    }
});

