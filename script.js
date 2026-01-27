fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("video-container");

    data.forEach(video => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${video.thumbnailUrl}">
        <div class="info">
          <h3>${video.title}</h3>
          <p>${video.duration} | ${video.views} views</p>
        </div>
      `;

      card.onclick = () => openPlayer(video.embedUrl);
      container.appendChild(card);
    });
  });

function openPlayer(url) {
  document.getElementById("playerModal").style.display = "block";
  document.getElementById("videoFrame").src = url;
}

document.getElementById("closeBtn").onclick = () => {
  document.getElementById("playerModal").style.display = "none";
  document.getElementById("videoFrame").src = "";
};
