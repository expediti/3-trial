// Configuration
const JSON_PATH = "videos.json"; 
const PER_PAGE = 16;

let allVideos = [];
let currentPage = 1;
let currentCategory = "All";

// ---------- INIT ----------
async function initApp() {
    try {
        const res = await fetch(JSON_PATH);
        if (!res.ok) throw new Error("Could not load videos.json");
        
        allVideos = await res.json();
        
        initHeader();
        initSearch();
        renderGrid();
    } catch (e) {
        console.error("Error:", e);
        document.getElementById("videoGrid").innerHTML = 
            `<p style="color:white; text-align:center; padding:20px;">
                Error loading videos. Please ensure <b>videos.json</b> is in the main folder.
            </p>`;
    }
}

// ---------- HEADER CATEGORIES ----------
function initHeader() {
    const nav = document.getElementById("categoryTabs");
    if (!nav) return;
    nav.innerHTML = "";

    const categories = ["All", "Instagram Viral", "Indian Leaked", "Telegram Viral"];

    categories.forEach(name => {
        const b = document.createElement("button");
        b.className = "cat-btn";
        if (name === "All") b.classList.add("active");
        b.innerText = name;
        
        b.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            
            currentCategory = name;
            currentPage = 1;
            renderGrid();
        };
        
        nav.appendChild(b);
    });
}

// ---------- RENDER GRID ----------
function renderGrid(customList = null) {
    const grid = document.getElementById("videoGrid");
    const pageInfo = document.getElementById("pageInfo");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    if (!grid) return;

    let list = customList || allVideos;
    
    if (!customList && currentCategory !== "All") {
        const keyword = currentCategory.split(" ")[0].toLowerCase(); 
        list = allVideos.filter(v => 
            v.title.toLowerCase().includes(keyword) || 
            (v.tags && v.tags.some(t => t.toLowerCase().includes(keyword)))
        );
    }

    const totalPages = Math.ceil(list.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = 1;
    
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageVideos = list.slice(start, end);

    grid.innerHTML = "";
    
    pageVideos.forEach(v => {
        // GENERATE RANDOM VIEW COUNT (e.g., 233k, 150k)
        const randomViews = Math.floor(Math.random() * 900 + 100) + 'k';

        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `
            <div class="card-thumb-container">
                <img 
                    src="${v.thumbnailUrl}" 
                    class="card-thumb" 
                    loading="lazy" 
                    onerror="this.onerror=null; this.src='https://placehold.co/600x400/151525/FFF?text=No+Preview';"
                >
                <span class="duration-badge">${v.duration || '00:00'}</span>
            </div>
            <div class="card-info">
                <div class="card-title">${v.title}</div>
                <div class="card-meta">
                    <span>${randomViews} views</span>
                </div>
            </div>
        `;

        
        //d.onclick = () => window.location.href = `watch.html?id=${v.id}`;
        d.onclick = () => window.location.href = `watch/${v.id}.html`;


        
        grid.appendChild(d);
    });

    if (pageInfo) pageInfo.innerText = `${currentPage} / ${totalPages}`;
    
    if (prev) {
        prev.disabled = currentPage === 1;
        prev.onclick = () => { currentPage--; renderGrid(customList); window.scrollTo(0,0); };
    }
    if (next) {
        next.disabled = currentPage === totalPages;
        next.onclick = () => { currentPage++; renderGrid(customList); window.scrollTo(0,0); };
    }
}

// ---------- SEARCH ----------
function initSearch() {
    const s = document.getElementById("searchInput");
    if (!s) return;

    s.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        if (!q) {
            renderGrid();
            return;
        }
        const results = allVideos.filter(v => v.title.toLowerCase().includes(q));
        currentPage = 1;
        renderGrid(results);
    };
}

document.addEventListener("DOMContentLoaded", initApp);
