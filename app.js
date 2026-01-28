const SOURCES = {
  Fuckmaza: "data/fuckmaza.json",
  Bhojpuri: "data/bhojpuri.json",
  Lol49: "data/lol49.json"
};

const PER_PAGE = 12;
let activeCategory = "Fuckmaza";
let page = 1;
let currentList = [];
let cache = {};

// ---------- UTILS ----------
const ensureViews = v => v < 1000 ? v + 1000 : v;

function rotate(arr, seed) {
  return [...arr].sort((a,b)=>
    (a.id.charCodeAt(0)+seed)-(b.id.charCodeAt(0))
  );
}

// ---------- LOAD CATEGORY ----------
async function loadCategory(cat) {
  activeCategory = cat;
  page = 1;

  try {
    if (!cache[cat]) {
      const res = await fetch(SOURCES[cat]);
      let data = await res.json();

      data.forEach(v => v.views = ensureViews(v.views || 0));
      cache[cat] = rotate(data, new Date().getHours() + cat.length);
    }

    currentList = cache[cat];
    render();
    highlightTab();
  } catch {
    alert("Category unavailable, switch to another.");
  }
}

// ---------- RENDER ----------
function render() {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const start = (page - 1) * PER_PAGE;
  const items = currentList.slice(start, start + PER_PAGE);

  items.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${v.thumbnailUrl}" loading="lazy">
      <div class="info">
        <b>${v.title}</b><br>
        ${v.duration} • ${v.views} views
      </div>`;
    d.onclick = () => location = `watch.html?id=${v.id}`;
    grid.appendChild(d);
  });

  pageInfo.innerText = `Page ${page}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = start + PER_PAGE >= currentList.length;
}

// ---------- HEADER ----------
function initHeader() {
  const nav = document.getElementById("categoryTabs");
  if (!nav) return;

  Object.keys(SOURCES).forEach(cat => {
    const b = document.createElement("button");
    b.innerText = cat;
    b.onclick = () => loadCategory(cat);
    nav.appendChild(b);
  });
}

function highlightTab() {
  document.querySelectorAll("nav button").forEach(b =>
    b.classList.toggle("active", b.innerText === activeCategory)
  );
}

// ---------- SEARCH (ALL JSONs) ----------
searchInput?.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const merged = Object.values(cache).flat();
  currentList = merged.filter(v => v.title.toLowerCase().includes(q));
  page = 1;
  render();
});

// ---------- PAGINATION ----------
prevBtn?.addEventListener("click", () => { page--; render(); });
nextBtn?.addEventListener("click", () => { page++; render(); });

// ---------- WATCH PAGE ----------
async function initWatch() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  for (const src of Object.values(SOURCES)) {
    try {
      const data = await (await fetch(src)).json();
      const v = data.find(x => x.id === id);
      if (v) {
        player.src = v.embedUrl;
        title.innerText = v.title;
        description.innerText = v.description;
        v.tags.forEach(t => {
          const s = document.createElement("span");
          s.innerText = `#${t} `;
          tags.appendChild(s);
        });
        break;
      }
    } catch {}
  }
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  loadCategory(activeCategory);
  initWatch();
});
