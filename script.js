const SOURCES = {
  Fuckmaza: "data/fuckmaza.json",
  Bhojpuri: "data/bhojpuri.json",
  Lol49: "data/lol49.json"
};

let cache = {};
let currentCategory = "Fuckmaza";
let currentVideos = [];
let currentPage = 1;
const PER_PAGE = 16;

/* ---------- UTIL ---------- */
function rotate(arr, seed) {
  return [...arr].sort((a, b) =>
    (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0))
  );
}

/* ---------- CATEGORY ---------- */
async function loadCategory(name) {
  currentCategory = name;
  currentPage = 1;

  if (!cache[name]) {
    const res = await fetch(SOURCES[name]);
    const data = await res.json();
    cache[name] = data;
  }

  const seed = new Date().getHours() + name.length;
  currentVideos = rotate(cache[name], seed);

  updateCategoryUI();
  renderGrid();
}

/* ---------- UI ---------- */
function updateCategoryUI() {
  const title = document.getElementById("activeCategory");
  const sub = document.getElementById("activeSubcategory");

  if (!title) return;

  title.innerText = currentCategory;

  const tag = currentVideos[0]?.tags?.find(t => t !== "xshiver");
  sub.innerText = tag ? `Subcategory: ${tag}` : "";
}

/* ---------- GRID + PAGINATION ---------- */
function renderGrid(list = currentVideos) {
  const grid = document.getElementById("videoGrid");
  const pageInfo = document.getElementById("pageInfo");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (!grid) return; // watch page safe

  const totalPages = Math.ceil(list.length / PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
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

  if (pageInfo) pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  if (prev) prev.disabled = currentPage === 1;
  if (next) next.disabled = currentPage === totalPages;
}

/* ---------- PAGINATION ---------- */
document.addEventListener("click", e => {
  if (e.target.id === "prev") {
    currentPage--;
    renderGrid();
    window.scrollTo(0, 0);
  }
  if (e.target.id === "next") {
    currentPage++;
    renderGrid();
    window.scrollTo(0, 0);
  }
});

/* ---------- SEARCH (ALL JSONs) ---------- */
function initSearch() {
  const s = document.getElementById("searchInput");
  if (!s) return;

  s.oninput = () => {
    const q = s.value.toLowerCase();
    const all = Object.values(cache).flat();
    currentPage = 1;
    renderGrid(all.filter(v => v.title.toLowerCase().includes(q)));
  };
}

/* ---------- HEADER ---------- */
function initHeader() {
  const nav = document.getElementById("categoryTabs");
  if (!nav) return;

  Object.keys(SOURCES).forEach(name => {
    const b = document.createElement("button");
    b.innerText = name;
    b.onclick = () => loadCategory(name);
    nav.appendChild(b);
  });
}

/* ---------- WATCH PAGE ---------- */
async function initWatch() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  for (const [name, url] of Object.entries(SOURCES)) {
    const res = await fetch(url);
    const data = await res.json();
    const video = data.find(v => v.id === id);

    if (video) {
      player.src = video.embedUrl;
      title.innerText = video.title;
      description.innerText = video.description;

      video.tags.forEach(t => {
        const s = document.createElement("span");
        s.innerText = `#${t}`;
        tags.appendChild(s);
      });

      const related = data.filter(v =>
        v.id !== video.id &&
        v.tags.some(t => video.tags.includes(t))
      ).slice(0, 12);

      related.forEach(v => {
        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `<img src="${v.thumbnailUrl}"><div class="info">${v.title}</div>`;
        d.onclick = () => location = `watch.html?id=${v.id}`;
        document.getElementById("related").appendChild(d);
      });

      break;
    }
  }
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initSearch();
  loadCategory(currentCategory);
  initWatch();
});
