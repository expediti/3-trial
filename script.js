const videoGrid = document.getElementById("videoGrid");
const videoPlayer = document.getElementById("videoPlayer");
const videoSource = document.getElementById("videoSource");
const videoTitle = document.getElementById("videoTitle");
const videoDescription = document.getElementById("videoDescription");

// Load videos from JSON
fetch("videos.json")
  .then(response => response.json())
  .then(videos => {
    videos.forEach(video => createVideoCard(video));

    // Auto play first video
    if (videos.length > 0) {
      playVideo(videos[0]);
    }
  })
  .catch(err => console.error("Error loading videos:", err));

function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  card.innerHTML = `
    <img src="${video.thumbnailUrl}" alt="${video.title}">
    <div class="info">
      <h4>${video.title}</h4>
      <span>${video.duration}</span>
    </div>
  `;

  card.addEventListener("click", () => playVideo(video));
  videoGrid.appendChild(card);
}

function playVideo(video) {
  videoSource.src = video.embedUrl;
  videoPlayer.load();
  videoPlayer.play();

  videoTitle.textContent = video.title;
  videoDescription.textContent = video.description;
  videoPlayer.poster = video.thumbnailUrl;
}
