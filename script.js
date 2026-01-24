let videosData = [];

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videosData = data;
    renderVideos(data);
  });

function renderVideos(videos) {
  const container = document.getElementById("videoContainer");
  container.innerHTML = "";

  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <img src="${video.thumbnailUrl || 'https://via.placeholder.com/300x200'}">
      <div class="content">
        <h3>${video.title}</h3>
        <p>${video.category} • ${video.duration}</p>
      </div>
    `;

    card.onclick = () => openModal(video);
    container.appendChild(card);
  });
}

// Modal
function openModal(video) {
  document.getElementById("videoModal").style.display = "block";
  document.getElementById("modalTitle").innerText = video.title;
  document.getElementById("modalDesc").innerText = video.description;
  document.getElementById("modalVideo").src = video.embedUrl;
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("videoModal").style.display = "none";
  document.getElementById("modalVideo").src = "";
};

// Search
document.getElementById("searchInput").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = videosData.filter(v =>
    v.title.toLowerCase().includes(value) ||
    v.category.toLowerCase().includes(value)
  );
  renderVideos(filtered);
});
