let allVideos = [];

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allVideos = data;
    renderVideos(allVideos);
    loadCategories(allVideos);
  });

const grid = document.getElementById("videoGrid");
const modal = document.getElementById("playerModal");
const frame = document.getElementById("playerFrame");
const titleEl = document.getElementById("playerTitle");
const descEl = document.getElementById("playerDesc");
const suggestionsList = document.getElementById("suggestionsList");

function renderVideos(videos) {
  grid.innerHTML = "";
  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${video.thumbnailUrl}">
      <div class="info">
        <h4>${video.title}</h4>
        <small>${video.duration}</small>
      </div>
    `;
    card.onclick = () => openPlayer(video);
    grid.appendChild(card);
  });
}

function openPlayer(video) {
  modal.style.display = "block";
  frame.src = video.embedUrl;
  titleEl.textContent = video.title;
  descEl.textContent = video.description;

  suggestionsList.innerHTML = "";
  video.suggestions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    suggestionsList.appendChild(li);
  });
}

document.querySelector(".close").onclick = () => {
  modal.style.display = "none";
  frame.src = "";
};

// Search
document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = allVideos.filter(v =>
    v.title.toLowerCase().includes(q)
  );
  renderVideos(filtered);
});

// Categories
function loadCategories(videos) {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(videos.map(v => v.category))];

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  select.onchange = () => {
    if (select.value === "all") {
      renderVideos(allVideos);
    } else {
      renderVideos(allVideos.filter(v => v.category === select.value));
    }
  };
}
