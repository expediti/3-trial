const SOURCES = {
  Fuckmaza: "data/fuckmaza.json",
  Bhojpuri: "data/bhojpuri.json",
  Lol49: "data/lol49.json"
};

let activeSource = "Fuckmaza";
let allVideos = [];
let currentVideos = [];

// ---------- HOURLY ROTATION ----------
function rotate(arr, seed) {
  return [...arr].sort((a,b)=>
    (a.id.charCodeAt(0)+seed) - (b.id.charCodeAt(0))
  );
}

// ---------- LOAD JSON ----------
async function loadCategory(name) {
  activeSource = name;
  try {
    const res = await fetch(SOURCES[name]);
    const data = await res.json();

    const seed = new Date().getHours() + name.length;
    currentVideos = rotate(data, seed);
    allVideos = Object.values(window.cache || {}).flat();

    window.cache[name] = data;

    updateUI();
  } catch {
    alert(`${name} unavailable. Try another category.`);
  }
}

// ---------- UI ----------
function updateUI() {
  document.getElementById("activeCategory").innerText = activeSource;

  const sub = currentVideos[0]?.tags?.find(t=>t!==activeSource.toLowerCase());
  document.getElementById("activeSubcategory").innerText =
    sub ? `Subcategory: ${sub}` : "";

  renderGrid(currentVideos);
}

function renderGrid(list) {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  grid.innerHTML = "";
  list.forEach(v=>{
    const d = document.createElement("div");
    d.className="card";
    d.innerHTML=`
      <img src="${v.thumbnailUrl}">
      <div class="info">
        <b>${v.title}</b><br>
        ${v.duration} • ${v.views} views
      </div>
    `;
    d.onclick=()=>location=`watch.html?id=${v.id}`;
    grid.appendChild(d);
  });
}

// ---------- HEADER ----------
function initHeader() {
  const nav = document.getElementById("categoryTabs");
  if (!nav) return;

  Object.keys(SOURCES).forEach(name=>{
    const b=document.createElement("button");
    b.innerText=name;
    b.onclick=()=>loadCategory(name);
    nav.appendChild(b);
  });
}

// ---------- SEARCH (ALL JSON FILES) ----------
function initSearch() {
  const s=document.getElementById("searchInput");
  if(!s)return;

  s.oninput=()=>{
    const q=s.value.toLowerCase();
    const merged=Object.values(window.cache).flat();
    renderGrid(merged.filter(v=>v.title.toLowerCase().includes(q)));
  };
}

// ---------- WATCH PAGE ----------
async function initWatch() {
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;

  for(const src of Object.values(SOURCES)){
    try{
      const res=await fetch(src);
      const data=await res.json();
      const v=data.find(x=>x.id===id);
      if(v){
        player.src=v.embedUrl;
        title.innerText=v.title;
        description.innerText=v.description;

        v.tags.forEach(t=>{
          const s=document.createElement("span");
          s.innerText=`#${t}`;
          tags.appendChild(s);
        });

        renderRelated(v,data);
        break;
      }
    }catch{}
  }
}

function renderRelated(cur,all){
  related.innerHTML="";
  all.filter(v=>v.id!==cur.id && v.tags.some(t=>cur.tags.includes(t)))
    .slice(0,6)
    .forEach(v=>{
      const d=document.createElement("div");
      d.className="card";
      d.innerHTML=`<img src="${v.thumbnailUrl}"><div class="info">${v.title}</div>`;
      d.onclick=()=>location=`watch.html?id=${v.id}`;
      related.appendChild(d);
    });
}

// ---------- INIT ----------
window.cache={};
document.addEventListener("DOMContentLoaded",()=>{
  initHeader();
  initSearch();
  loadCategory(activeSource);
  initWatch();
});
