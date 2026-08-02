// 1. Initialize IndexedDB Engine Settings (Permanent Local Storage Setup)
const DB_NAME = "StevenTVPremiumDB";
const DB_VERSION = 4; // Upgraded version channel to reset broken schemas layout structures
const STORE_NAME = "media_library";
let db = null;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (e) => {
    let database = e.target.result;
    if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
    }
    database.createObjectStore(STORE_NAME, { keyPath: "id" });
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadDashboard();
};

// 2. Element Selectors Mapping Layouts Channels Nodes
const mainVideo = document.getElementById('main-video');
const videoTrack = document.getElementById('video-track');
const cinemaStage = document.getElementById('cinema-stage');
const cinemaTitle = document.getElementById('cinema-title');
const cinemaDescription = document.getElementById('cinema-description');
const closeCinemaBtn = document.getElementById('close-cinema-btn');
const searchBar = document.getElementById('search-bar');
const gridMovies = document.getElementById('grid-movies');
const rowDynamicTitle = document.getElementById('row-dynamic-title');

// Modals Nodes Layouts Controls Mapping
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');

let activeStreams = [];
let cachedItems = [];
let currentCategoryFilter = "all";

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// 3. Central Media Deployment Streaming Router Engine
function targetMediaLoad(movie) {
    clearStreams();
    cinemaStage.classList.remove('hidden');
    
    // Generate valid runtime streaming links directly from raw binary data payloads
    const videoStream = URL.createObjectURL(movie.videoBlob);
    activeStreams.push(videoStream);
    mainVideo.src = videoStream;
    
    cinemaTitle.textContent = movie.title;
    cinemaDescription.textContent = `[${movie.category || 'Movie'}] — ${movie.description}`;

    // Subtitle stream slot verification handling loop blocks
    if (movie.subsBlob) {
        const subsStream = URL.createObjectURL(movie.subsBlob);
        activeStreams.push(subsStream);
        videoTrack.src = subsStream;
        videoTrack.mode = "showing";
    } else {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }

    mainVideo.load();
    mainVideo.play();
    cinemaStage.scrollIntoView({ behavior: 'smooth' });
}

closeCinemaBtn.addEventListener('click', () => {
    mainVideo.pause();
    cinemaStage.classList.add('hidden');
    clearStreams();
});

// 4. Render Dashboard and Category Filter Matrix Lookups
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        cachedItems = getAllRequest.result;
        renderFilteredGrid();
    };
}

function renderFilteredGrid() {
    gridMovies.innerHTML = '';
    
    let displayItems = cachedItems;
    if (currentCategoryFilter !== "all") {
        displayItems = cachedItems.filter(item => item.category === currentCategoryFilter);
        rowDynamicTitle.textContent = `Browsing Collection: ${currentCategoryFilter}s`;
    } else {
        rowDynamicTitle.textContent = "Your Movie Collection (All Categories)";
    }

    if (displayItems.length === 0) {
        gridMovies.innerHTML = `<p style="padding: 20px; color:#858f99; font-style:italic;">No media uploads available in this classification tier section yet.</p>`;
        return;
    }

    displayItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const cardThumb = URL.createObjectURL(item.thumbBlob);
        activeStreams.push(cardThumb);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <button class="delete-movie-btn" data-id="${item.id}">✕</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div style="font-size:11px; color:#858f99; margin-top:3px;">${item.category || 'Movie'} ${item.subsBlob ? '• Subtitles' : ''}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(item);
        });

        card.querySelector('.delete-movie-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${item.title}" from local client memory blocks permanently?`)) {
                deleteItem(item.id);
            }
        });

        gridMovies.appendChild(card);
    });
}

function deleteItem(id) {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id).onsuccess = () => loadDashboard();
}

// 5. Security Panel Gateway Controllers
const STEVENTV_SECRET = "admin123";

openAdminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminModal.classList.add('active');
    uploadForm.classList.add('hidden');
    document.getElementById('admin-auth-zone').classList.remove('hidden');
    adminPassInput.value = "";
    authErrorMsg.textContent = "";
});

closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));

btnAuthorize.addEventListener('click', () => {
    if (adminPassInput.value === STEVENTV_SECRET) {
        document.getElementById('admin-auth-zone').classList.add('hidden');
        uploadForm.classList.remove('hidden');
    } else {
        authErrorMsg.textContent = "Invalid Admin Key.";
    }
});

// 6. Extraction Form Handler Loop (Fixing File Persistence Structure)
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const videoInput = document.getElementById('form-video').files[0]; // FIX: Extract direct binary item data
    const thumbInput = document.getElementById('form-thumb').files[0]; // FIX: Extract direct binary item data
    const subsInput = document.getElementById('form-subtitles').files[0]; // Extract direct subtitle file info

    if (!videoInput || !thumbInput) {
        alert("Please ensure both video assets and thumbnail cards are specified properly.");
        return;
    }

    const movieEntry = {
        id: "media-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value,
        description: document.getElementById('form-desc').value.trim(),
        videoBlob: videoInput, // Persisted seamlessly inside IndexedDB payload records
        thumbBlob: thumbInput, // Persisted seamlessly inside IndexedDB payload records
        subsBlob: subsInput || null
    };

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    store.add(movieEntry).onsuccess = () => {
        loadDashboard();
        uploadForm.reset();
        adminModal.classList.remove('active');
        alert(`"${movieEntry.title}" has been saved permanently inside your browser hard drive vault blocks!`);
    };

    transaction.onerror = (err) => {
        console.error("Database storage rejection logic caught:", err);
        alert("Persistence error: Please ensure the video length/size complies with local host storage capacities thresholds.");
    };
});

// 7. Connect Sidebar Filtering Navigation Click Hooks Channels
document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.id === "open-admin-btn") return;
        e.preventDefault();
        
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        btn.classList.add('active');
        
        currentCategoryFilter = btn.getAttribute('data-filter');
        renderFilteredGrid();
    });
});

searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const baseSet = currentCategoryFilter === "all" ? cachedItems : cachedItems.filter(i => i.category === currentCategoryFilter);
    const matches = baseSet.filter(m => m.title.toLowerCase().includes(term));
    populateRows(matches);
});
