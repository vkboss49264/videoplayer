// videoUtils.js

export function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/)([^"&?\/\s]{11}))/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
