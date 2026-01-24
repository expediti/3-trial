// Video Gallery JavaScript
let videosData = [];
let filteredVideos = [];

// Load videos from database
async function loadVideos() {
    try {
        const response = await fetch('../database/videos.json');
        if (!response.ok) {
            throw new Error('Database not found');
        }
        videosData = await response.json();
        filteredVideos = videosData;
        
        updateStats();
        displayVideos(filteredVideos);
        
        // Show grid or empty state
        if (videosData.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showEmptyState();
    }
}

// Update statistics
function updateStats() {
    const totalVideos = videosData.length;
    const mp4Count = videosData.filter(v => v.video_type === 'mp4').length;
    const m3u8Count = videosData.filter(v => v.video_type === 'm3u8').length;
    
    document.getElementById('total-videos').textContent = totalVideos;
    document.getElementById('mp4-count').textContent = mp4Count;
    document.getElementById('m3u8-count').textContent = m3u8Count;
}

// Display videos in grid
function displayVideos(videos) {
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '';
    
    if (videos.length === 0 && videosData.length > 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white; font-size: 1.2rem;">No videos match your search criteria</div>';
        return;
    }
    
    videos.forEach((video, index) => {
        const card = createVideoCard(video, index);
        grid.appendChild(card);
    });
}

// Create video card element
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => playVideo(video);
    
    // Determine badge class
    let badgeClass = 'badge-other';
    if (video.video_type === 'mp4') badgeClass = 'badge-mp4';
    else if (video.video_type === 'm3u8') badgeClass = 'badge-m3u8';
    else if (video.video_type === 'webm') badgeClass = 'badge-webm';
    
    // Create thumbnail
    let thumbnailHTML;
    if (video.thumbnail_url) {
        thumbnailHTML = `<img src="${video.thumbnail_url}" alt="${video.title}" class="video-thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="video-thumbnail no-thumb" style="display: none;">🎬</div>`;
    } else {
        thumbnailHTML = `<div class="video-thumbnail no-thumb">🎬</div>`;
    }
    
    card.innerHTML = `
        ${thumbnailHTML}
        <div class="video-card-content">
            <h3 class="video-card-title">${video.title}</h3>
            <div class="video-card-meta">
                <span class="video-badge ${badgeClass}">${video.video_type.toUpperCase()}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Play video in modal
function playVideo(video) {
    const playerSection = document.getElementById('video-player-section');
    const videoPlayer = document.getElementById('main-video-player');
    const videoSource = document.getElementById('video-source');
    const videoTitle = document.getElementById('video-title');
    const videoDetails = document.getElementById('video-details');
    
    // Set video source
    videoSource.src = video.video_url;
    
    // Determine video type for source
    let mimeType = 'video/mp4';
    if (video.video_type === 'm3u8') {
        mimeType = 'application/x-mpegURL';
    } else if (video.video_type === 'webm') {
        mimeType = 'video/webm';
    }
    videoSource.type = mimeType;
    
    // Set video info
    videoTitle.textContent = video.title;
    
    const scrapedDate = new Date(video.scraped_at).toLocaleDateString();
    videoDetails.innerHTML = `
        <strong>Type:</strong> ${video.video_type.toUpperCase()}<br>
        <strong>Source:</strong> <a href="${video.source_page}" target="_blank" style="color: #667eea;">${video.source_page}</a><br>
        <strong>Scraped:</strong> ${scrapedDate}<br>
        <strong>Video URL:</strong> <a href="${video.video_url}" target="_blank" style="color: #667eea; word-break: break-all;">${video.video_url}</a>
    `;
    
    // Load and play
    videoPlayer.load();
    playerSection.classList.remove('hidden');
    
    // For M3U8 streams, you might need HLS.js library
    if (video.video_type === 'm3u8' && window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(video.video_url);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoPlayer.play();
        });
    } else {
        videoPlayer.play().catch(e => {
            console.error('Playback error:', e);
            alert('Unable to play this video. The format might not be supported by your browser.');
        });
    }
}

// Close video player
document.getElementById('close-player').addEventListener('click', () => {
    const playerSection = document.getElementById('video-player-section');
    const videoPlayer = document.getElementById('main-video-player');
    
    videoPlayer.pause();
    playerSection.classList.add('hidden');
});

// Close player with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const playerSection = document.getElementById('video-player-section');
        if (!playerSection.classList.contains('hidden')) {
            document.getElementById('close-player').click();
        }
    }
});

// Search functionality
document.getElementById('search-box').addEventListener('input', (e) => {
    filterVideos();
});

// Filter by type
document.getElementById('filter-type').addEventListener('change', (e) => {
    filterVideos();
});

// Filter videos based on search and type
function filterVideos() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    
    filteredVideos = videosData.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm) || 
                             video.source_page.toLowerCase().includes(searchTerm);
        
        const matchesType = filterType === 'all' || 
                           video.video_type === filterType ||
                           (filterType === 'other' && !['mp4', 'm3u8', 'webm'].includes(video.video_type));
        
        return matchesSearch && matchesType;
    });
    
    displayVideos(filteredVideos);
}

// Show/hide empty state
function showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.querySelector('.stats').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
}

function hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
    document.querySelector('.stats').style.display = 'grid';
    document.querySelector('.controls').style.display = 'flex';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

// Reload button functionality (you can add this to UI if needed)
function reloadVideos() {
    loadVideos();
}

// Make reload available globally
window.reloadVideos = reloadVideos;
