let videos = [];
let page = 1;
const perPage = 12;

// Hourly rotation
const hourKey = new Date().getHours();

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videos = shuffle(data, hourKey);
    loadTags();
    renderTrending();
    render();
  });

function shuffle(arr, seed) {
  return arr.sort((a, b) => (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0)));
}

function render() {
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = "";

  const start = (page - 1) * perPage;
  const list = filtered().slice(start, start + perPage);

  list.forEach(v => grid.appendChild(card(v)));

  pageNum.innerText = `Page ${page}`;
}

function card(v) {
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img src="${v.thumbnailUrl}">
    <div class="info">
      <h4>${v.title}</h4>
      <small>${v.duration} | ${v.views} views</small>
    </div>
  `;
  d.onclick = () => location = `watch.html?id=${v.id}`;
  return d;
}

function filtered() {
  const q = search.value.toLowerCase();
  const tag = tagFilter.value;

  return videos.filter(v =>
    v.title.toLowerCase().includes(q) &&
    (tag === "all" || v.tags.includes(tag))
  );
}

search.oninput = () => { page = 1; render(); };
tagFilter.onchange = () => { page = 1; render(); };

prev.onclick = () => { if (page > 1) page--; render(); };
next.onclick = () => {
  if (page * perPage < filtered().length) page++;
  render();
};

function loadTags() {
  const tags = new Set();
  videos.forEach(v => v.tags.forEach(t => tags.add(t)));
  tags.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    tagFilter.appendChild(o);
  });
}

function renderTrending() {
  const t = [...videos].sort((a,b)=>b.uploadedAt.localeCompare(a.uploadedAt)).slice(0,4);
  const box = document.getElementById("trending");
  t.forEach(v => box.appendChild(card(v)));
}
