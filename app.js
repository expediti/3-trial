const SOURCES = {
    "Instagram Viral": "data/fuckmaza.json",
    "Indian Leaked": "data/bhojpuri.json",
    "Telegram Viral": "data/lol49.json"
};

let cache = {};
let currentCategory = "Instagram Viral";
let currentVideos = [];
let currentPage = 1;
const PER_PAGE = 16; // You asked for 10-16

// ---------- HOURLY ROTATION (Logic Unchanged) ----------
function rotate(arr, seed) {
    return [...arr].sort((a, b) =>
        (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed)
    );
}

// ---------- LOAD CATEGORY (Logic Unchanged) ----------
async function loadCategory(name) {
    currentCategory = name;
    currentPage = 1;

    if (!cache[name]) {
        try {
            // NOTE: Ensure these paths match your folder structure exactly
            const res = await fetch(SOURCES[name]);
            if (!res.ok) throw new Error("File not found");
            cache[name] = await res.json();
        } catch (e) {
            console.error("Error loading category:", name, e);
            // Fallback for safety if file missing
            cache[name] = []; 
        }
    }

    const seed = new Date().getHours() + name.length;
    currentVideos = rotate(cache[name], seed);

    renderGrid();
    updateCategoryUI();
}

// ---------- CATEGORY UI ----------
function updateCategoryUI() {
    const buttons = document.querySelectorAll('#categoryTabs button');
    buttons.forEach(b => {
        if (b.dataset.category === currentCategory) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

// ---------- RENDER GRID (Updated for New UI) ----------
function renderGrid(list = currentVideos) {
    const grid = document.getElementById("videoGrid");
    const pageInfo = document.getElementById("pageInfo");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    if (!grid) return;

    // Pagination Logic
    const totalPages = Math.ceil(list.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = 1;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageVideos = list.slice(start, end);

    grid.innerHTML = "";

    pageVideos.forEach(v => {
        const d = document.createElement("div");
        d.className = "card";
        
        // New clean HTML structure
        d.innerHTML = `
            <div style="position:relative;">
                <img src="${v.thumbnailUrl}" class="card-thumb" loading="lazy" alt="Thumbnail">
                <span class="duration-badge">${v.duration || '00:00'}</span>
            </div>
            <div class="card-info">
                <div class="card-title">${v.title}</div>
                <div class="card-meta">
                    <span>${v.views ? v.views + ' views' : 'New'}</span>
                </div>
            </div>
        `;
        
        d.onclick = () => window.location.href = `watch.html?id=${v.id}`;
        grid.appendChild(d);
    });

    if (pageInfo) pageInfo.innerText = `${currentPage} / ${totalPages}`;
    if (prev) prev.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
}

// ---------- HEADER INIT ----------
function initHeader() {
    const nav = document.getElementById("categoryTabs");
    if (!nav) return;
    nav.innerHTML = ""; // Clear existing

    Object.keys(SOURCES).forEach(name => {
        const b = document.createElement("button");
        b.innerText = name;
        b.className = "cat-btn"; // New class
        b.dataset.category = name;
        b.onclick = () => loadCategory(name);
        nav.appendChild(b);
    });
}

// ---------- SEARCH ----------
function initSearch() {
    const s = document.getElementById("searchInput");
    if (!s) return;

    s.oninput = () => {
        const q = s.value.toLowerCase();
        // Search across all cached categories for better results
        const all = Object.values(cache).flat(); 
        const results = all.filter(v => v.title && v.title.toLowerCase().includes(q));
        
        // If nothing cached yet, search current only
        if (all.length === 0) {
             renderGrid(currentVideos.filter(v => v.title.toLowerCase().includes(q)));
        } else {
             currentPage = 1;
             renderGrid(results);
        }
    };
}

// ---------- PAGINATION LISTENERS ----------
document.addEventListener("click", e => {
    if (e.target.id === "prev") {
        currentPage--;
        renderGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.target.id === "next") {
        currentPage++;
        renderGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ---------- STARTUP ----------
document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initSearch();
    loadCategory(currentCategory);
});
