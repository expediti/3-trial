const SOURCES = {
  Fuckmaza: "data/fuckmaza.json",
  Bhojpuri: "data/bhojpuri.json",
  Lol49: "data/lol49.json"
};

let activeCategory = "Fuckmaza";
let cache = {};
let currentVideos = [];
let page = 1;
const PER_PAGE = 16;

function rotate(arr, seed) {
  return [...arr].sort((a,b)=> (a.id.charCodeAt(0)+seed)-(b.id.charCodeAt(0)));
}

async function loadCategory(name){
  activeCategory=name;
  page=1;

  if(!cache[name]){
    const res = await fetch(SOURCES[name]);
    const data = await res.json();
    const seed = new Date().getHours()+name.length;
    cache[name] = rotate(data,seed);
  }

  currentVideos = cache[name];
  updateCategoryUI();
  renderPage();
}

function updateCategoryUI(){
  document.getElementById("activeCategory").innerText = activeCategory;
  const tag = currentVideos[0]?.tags?.[1];
  document.getElementById("activeSubcategory").innerText = tag ? "Subcategory: "+tag : "";
}

function renderPage(){
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = "";

  const start=(page-1)*PER_PAGE;
  const items=currentVideos.slice(start,start+PER_PAGE);

  items.forEach(v=>{
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`<img src="${v.thumbnailUrl}"><div class="info">${v.title}</div>`;
    d.onclick=()=>location=`watch.html?id=${v.id}`;
    grid.appendChild(d);
  });

  const totalPages=Math.ceil(currentVideos.length/PER_PAGE);
  document.getElementById("pageInfo").innerText=`Page ${page} of ${totalPages}`;
  prevBtn.disabled=page===1;
  nextBtn.disabled=page>=totalPages;
}

prevBtn.onclick=()=>{page--;renderPage()};
nextBtn.onclick=()=>{page++;renderPage()};

function initCategories(){
  const nav=document.getElementById("categoryTabs");
  Object.keys(SOURCES).forEach(c=>{
    const b=document.createElement("button");
    b.innerText=c;
    b.onclick=()=>loadCategory(c);
    nav.appendChild(b);
  });
}

searchInput.oninput=()=>{
  const q=searchInput.value.toLowerCase();
  const all=Object.values(cache).flat();
  currentVideos = all.filter(v=>v.title.toLowerCase().includes(q));
  page=1;
  renderPage();
};

document.addEventListener("DOMContentLoaded",()=>{
  initCategories();
  loadCategory(activeCategory);
});
