// --- CONFIGURATION ---
const ITEMS_PER_PAGE = 15; // As requested, 12-15 videos
let allVideos = [];
let currentList = [];
let currentPage = 1;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Data
    fetch('videos.json')
        .then(res => res.json())
        .then(data => {
            // Apply Hourly Rotation Logic
            allVideos = rotateByHour(data);
            currentList = allVideos;

            // 2. Determine Page Type
            if (document.body.classList.contains('page-home')) {
                initHomePage();
            } else if (document.body.classList.contains('page-watch')) {
                initWatchPage();
            }
        })
        .catch(err => console.error("Error loading DB:", err));
});

// --- UTILS: Hourly Rotation ---
function rotateByHour(data) {
    const hour = new Date().getHours();
    let array = [...data];
    let seed = hour; // Use current hour as seed
    
    // Simple seeded shuffle
    const random = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    let m = array.length, t, i;
    while (m) {
        i = Math.floor(random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// --- HOME PAGE LOGIC ---
function initHomePage() {
    populateTagFilter();
    renderSidebarTrending();
    renderGrid(1);

    // Search Listener
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if(e.key === 'Enter') performSearch();
    });
}

function renderGrid(page) {
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '';

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = currentList.slice(start, end);

    if (pageItems.length === 0) {
        grid.innerHTML = '<p style="padding:20px">No results found.</p>';
        return;
    }

    pageItems.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        // Open watch.html with video ID
        card.onclick = () => window.location.href = `watch.html?id=${video.id}`;

        const thumb = video.thumbnailUrl || 'https://via.placeholder.com/400x225/000?text=No+Preview';

        card.innerHTML = `
            <div class="thumb">
                <img src="${thumb}" alt="${video.title}">
                <span class="duration">${video.duration}</span>
            </div>
            <div class="card-info">
                <h3 class="card-title">${video.title}</h3>
                <div class="card-meta">
                    <span>${video.category}</span> • 
                    <span>${video.views} views</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update Pagination UI
    const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
    document.getElementById('pageIndicator').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevBtn').disabled = (currentPage === 1);
    document.getElementById('nextBtn').disabled = (currentPage >= totalPages);
}

function changePage(dir) {
    currentPage += dir;
    renderGrid(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) {
        currentList = allVideos;
    } else {
        currentList = allVideos.filter(v => v.title.toLowerCase().includes(query));
    }
    currentPage = 1;
    renderGrid(1);
}

function populateTagFilter() {
    const tags = new Set();
    allVideos.forEach(v => v.tags.forEach(t => tags.add(t)));
    const select = document.getElementById('tagFilter');
    
    tags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.innerText = tag;
        select.appendChild(opt);
    });
}

function applyFilter() {
    const val = document.getElementById('tagFilter').value;
    if (val === 'all') currentList = allVideos;
    else currentList = allVideos.filter(v => v.tags.includes(val));
    currentPage = 1;
    renderGrid(1);
}

function renderSidebarTrending() {
    const container = document.getElementById('sidebar-list');
    // Just pick first 5 from rotated list as "trending"
    const trending = allVideos.slice(0, 5); 
    
    trending.forEach(v => {
        const item = createListItem(v);
        container.appendChild(item);
    });
}

// --- WATCH PAGE LOGIC ---
function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');

    const video = allVideos.find(v => v.id === videoId);

    if (!video) {
        document.getElementById('videoTitle').innerText = "Video not found.";
        return;
    }

    // Populate Player
    document.getElementById('mainPlayer').src = video.embedUrl;
    document.getElementById('videoTitle').innerText = video.title;
    document.getElementById('videoViews').innerText = `${video.views} views`;
    document.getElementById('videoDate').innerText = new Date(video.uploadedAt).toDateString();
    document.getElementById('videoDescription').innerText = video.description;

    // Populate Tags
    const tagsDiv = document.getElementById('videoTags');
    video.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = `#${t}`;
        tagsDiv.appendChild(span);
    });

    // Populate Related Videos (based on category or tags)
    const relatedList = document.getElementById('related-list');
    const related = allVideos.filter(v => v.id !== video.id && v.tags.some(t => video.tags.includes(t))).slice(0, 10);
    
    related.forEach(v => {
        relatedList.appendChild(createListItem(v));
    });
}

// --- HELPER: Create Small List Item (Sidebar/Related) ---
function createListItem(video) {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.onclick = () => window.location.href = `watch.html?id=${video.id}`;
    
    const thumb = video.thumbnailUrl || 'https://via.placeholder.com/160x90/000?text=Wait';

    div.innerHTML = `
        <img src="${thumb}" alt="thumb">
        <div class="list-item-info">
            <h4>${video.title}</h4>
            <span>${video.views} views</span>
        </div>
    `;
    return div;
}
