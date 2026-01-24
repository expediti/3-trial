// Configuration
const ITEMS_PER_PAGE = 12; // 12 videos per page
let allVideos = [];     // Master list
let currentList = [];   // Filtered list
let currentPage = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetch('videos.json')
        .then(res => res.json())
        .then(data => {
            // Apply Hourly Rotation
            const rotatedData = rotateByHour(data);
            
            allVideos = rotatedData;
            currentList = rotatedData;
            
            populateFilters();
            populateTrending();
            renderPage(1);
        })
        .catch(err => console.error("Error loading videos.json:", err));
});

/**
 * Rotates video order based on the current hour.
 * Uses the hour as a seed for a pseudo-random shuffle.
 */
function rotateByHour(data) {
    const hour = new Date().getHours(); 
    // Clone data to avoid mutating original immediately
    let array = [...data];
    
    // Seeded shuffle algorithm
    let m = array.length, t, i;
    let seed = hour; // Using hour as seed

    const random = () => {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    while (m) {
        i = Math.floor(random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// Render the main grid
function renderPage(page) {
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '';
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const videosToShow = currentList.slice(start, end);

    if(videosToShow.length === 0) {
        grid.innerHTML = '<p style="padding:20px">No videos found matching criteria.</p>';
        return;
    }

    videosToShow.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => openPlayer(video);
        
        // Thumbnail handling
        const thumb = video.thumbnailUrl || 'https://via.placeholder.com/600x340/000?text=No+Img';

        card.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${thumb}" alt="thumb">
                <span class="duration">${video.duration}</span>
            </div>
            <div class="info">
                <h3>${video.title}</h3>
                <p>${video.views} views • ${new Date(video.uploadedAt).toLocaleDateString()}</p>
            </div>
        `;
        grid.appendChild(card);
    });

    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Pagination Logic
function updatePagination() {
    const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
    document.getElementById('pageIndicator').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    
    document.getElementById('prevBtn').disabled = (currentPage === 1);
    document.getElementById('nextBtn').disabled = (currentPage >= totalPages);
}

function changePage(dir) {
    currentPage += dir;
    renderPage(currentPage);
}

// Search Feature (Title only)
function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if(!query) {
        currentList = allVideos;
    } else {
        currentList = allVideos.filter(v => v.title.toLowerCase().includes(query));
    }
    currentPage = 1;
    renderPage(1);
}

// Filter Feature (By Tags)
function populateFilters() {
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
    const tag = document.getElementById('tagFilter').value;
    if(tag === 'all') {
        currentList = allVideos;
    } else {
        currentList = allVideos.filter(v => v.tags.includes(tag));
    }
    currentPage = 1;
    renderPage(1);
}

// Recent/Trending Sidebar
function populateTrending() {
    // Sort by Date (Newest first)
    const recent = [...allVideos].sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 8);
    
    const container = document.getElementById('trending-container');
    container.innerHTML = '';

    recent.forEach(v => {
        const div = document.createElement('div');
        div.className = 'side-item';
        div.onclick = () => openPlayer(v);
        div.innerHTML = `
            <img src="${v.thumbnailUrl || 'https://via.placeholder.com/100'}" alt="t">
            <div class="side-info">
                <h4>${v.title.substring(0, 30)}...</h4>
                <small>${v.views} views</small>
            </div>
        `;
        container.appendChild(div);
    });
}

// Video Player Modal & Related Videos
function openPlayer(video) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    
    // Set Video
    iframe.src = video.embedUrl;
    document.getElementById('modalTitle').innerText = video.title;
    document.getElementById('modalViews').innerText = `${video.views} views`;
    document.getElementById('modalDate').innerText = new Date(video.uploadedAt).toDateString();

    // Populate Related Videos (Matching Tags)
    const relatedContainer = document.getElementById('related-container');
    relatedContainer.innerHTML = '';
    
    const related = allVideos.filter(v => 
        v.id !== video.id && v.tags.some(t => video.tags.includes(t))
    ).slice(0, 10);

    related.forEach(v => {
        const div = document.createElement('div');
        div.className = 'side-item';
        div.onclick = () => openPlayer(v);
        div.innerHTML = `
            <img src="${v.thumbnailUrl || 'https://via.placeholder.com/100'}" alt="t">
            <div class="side-info">
                <h4>${v.title.substring(0, 30)}...</h4>
                <small>${v.duration}</small>
            </div>
        `;
        relatedContainer.appendChild(div);
    });

    modal.style.display = "block";
}

function closePlayer() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    iframe.src = ""; // Stop playback
    modal.style.display = "none";
}

// Close on outside click
window.onclick = function(e) {
    const modal = document.getElementById('videoModal');
    if (e.target == modal) closePlayer();
}
