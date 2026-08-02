// 1. Initialize IndexedDB Engine Settings
const DB_NAME = "StevenTVPremiumDB";
const DB_VERSION = 1;
const STORE_NAME = "media_library";
let db = null;

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (e) => {
    let database = e.target.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadDashboard();
};

// 2. Element Selectors Mapping Layouts
const mainVideo = document.getElementById('main-video');
const cinemaStage = document.getElementById('cinema-stage');
const cinemaTitle = document.getElementById('cinema-title');
const cinemaDescription = document.getElementById('cinema-description');
const closeCinemaBtn = document.getElementById('close-cinema-btn');
const searchBar = document.getElementById('search-bar');
const gridMovies = document.getElementById('grid-movies');

// Modals Nodes
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');

let activeStreams = [];

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// 3. Central Media Deployment Router Engine
function targetMediaLoad(movie) {
    clearStreams();
    cinemaStage.classList.remove('hidden');
    
    const videoStream = URL.createObjectURL(movie.videoBlob[0]);
    activeStreams.push(videoStream);
    
    mainVideo.src = videoStream;
    cinemaTitle.textContent = movie.title;
    cinemaDescription.textContent = movie.description;

    mainVideo.load();
    mainVideo.play();
    cinemaStage.scrollIntoView({ behavior: 'smooth' });
}

closeCinemaBtn.addEventListener('click', () => {
    mainVideo.pause();
    cinemaStage.classList.add('hidden');
    clearStreams();
});

// 4. Render Dashboard and Rows Interface Channels
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        populateRows(getAllRequest.result);
    };
}

function populateRows(items) {
    gridMovies.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const cardThumb = URL.createObjectURL(item.thumbBlob[0]);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <button class="delete-movie-btn" data-id="${item.id}">✕</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(item);
        });

        card.querySelector('.delete-movie-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${item.title}"?`)) {
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

// 5. Security Panel Controller
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

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const movieEntry = {
        id: "media-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        description: document.getElementById('form-desc').value.trim(),
        videoBlob: document.getElementById('form-video').files,
        thumbBlob: document.getElementById('form-thumb').files
    };

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.add(movieEntry).onsuccess = () => {
        loadDashboard();
        uploadForm.reset();
        adminModal.classList.remove('active');
    };
});

searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const getAllRequest = transaction.objectStore(STORE_NAME).getAll();

    getAllRequest.onsuccess = () => {
        const matches = getAllRequest.result.filter(m => m.title.toLowerCase().includes(term));
        populateRows(matches);
    };
});
