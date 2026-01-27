fetch("videos.json")
  .then(res => res.json())
  .then(data => loadVideos(data));

function loadVideos(videos) {
  const grid = document.getElementById("video-grid");

  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${video.thumbnailUrl}">
      <div class="info">
        <h3>${video.title.slice(0, 50)}...</h3>
        <p>${video.duration} • ${video.views} views</p>
      </div>
    `;
    card.onclick = () => openPlayer(video);
    grid.appendChild(card);
  });
}

function openPlayer(video) {
  document.getElementById("playerModal").style.display = "block";
  document.getElementById("videoPlayer").src = video.embedUrl;
  document.getElementById("videoTitle").innerText = video.title;
  document.getElementById("videoDesc").innerText = video.description;
}

function closePlayer() {
  document.getElementById("playerModal").style.display = "none";
  document.getElementById("videoPlayer").pause();
}
