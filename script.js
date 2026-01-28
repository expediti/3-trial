let currentPage = 1;
const VIDEOS_PER_PAGE = 16;
let activeList = [];

// Update grid with pagination
function renderGrid(list) {
  activeList = list;

  const grid = document.getElementById("videoGrid");
  const pageInfo = document.getElementById("pageInfo");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (!grid) return;

  const totalPages = Math.ceil(list.length / VIDEOS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * VIDEOS_PER_PAGE;
  const end = start + VIDEOS_PER_PAGE;
  const pageVideos = list.slice(start, end);

  grid.innerHTML = "";

  pageVideos.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${v.thumbnailUrl}">
      <div class="info">
        <b>${v.title}</b><br>
        ${v.duration} • ${v.views} views
      </div>
    `;
    d.onclick = () => location = `watch.html?id=${v.id}`;
    grid.appendChild(d);
  });

  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

  prev.disabled = currentPage === 1;
  next.disabled = currentPage === totalPages;
}

// Buttons
document.getElementById("prev").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderGrid(activeList);
    window.scrollTo(0, 0);
  }
};

document.getElementById("next").onclick = () => {
  const totalPages = Math.ceil(activeList.length / VIDEOS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderGrid(activeList);
    window.scrollTo(0, 0);
  }
};

// Reset page when category changes
async function loadCategory(name) {
  activeSource = name;
  currentPage = 1;

  try {
    const res = await fetch(SOURCES[name]);
    const data = await res.json();

    const seed = new Date().getHours() + name.length;
    currentVideos = rotate(data, seed);

    window.cache[name] = data;

    updateUI();
  } catch {
    alert(`${name} is offline. Try another category.`);
  }
}

// Reset page on search
function initSearch() {
  const s = document.getElementById("searchInput");
  if (!s) return;

  s.oninput = () => {
    const q = s.value.toLowerCase();
    const merged = Object.values(window.cache).flat();
    currentPage = 1;
    renderGrid(merged.filter(v => v.title.toLowerCase().includes(q)));
  };
}
