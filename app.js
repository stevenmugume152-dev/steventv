// 1. Initialize IndexedDB Engine Settings
const DB_NAME = "StevenTVLocalDB";
const DB_VERSION = 1;
const STORE_NAME = "movies";
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
    loadCatalogFromDB();
};

request.onerror = (e) => {
    console.error("IndexedDB initialization database error: ", e.target.error);
};

// 2. DOM Elements Mapping
const mainVideo = document.getElementById('main-video');
const videoTrack = document.getElementById('video-track');
const movieTitle = document.getElementById('movie-title');
const movieCategory = document.getElementById('movie-category');
const movieDescription = document.getElementById('movie-description');
const movieGrid = document.getElementById('movie-grid');
const searchBar = document.getElementById('search-bar');

const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminAuthZone = document.getElementById('admin-auth-zone');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');

// Keep track of runtime revocable object streams URLs to avoid system memory leaks
let activeBlobURLs = [];

function clearActiveStreams() {
    activeBlobURLs.forEach(url => URL.revokeObjectURL(url));
    activeBlobURLs = [];
}

// 3. Central Media Renderer Pipeline
function targetMediaLoad(movie) {
    clearActiveStreams();

    // Convert stored file blobs back into runnable browser video streams elements
    const videoStream = URL.createObjectURL(movie.videoBlob);
    const thumbStream = URL.createObjectURL(movie.thumbBlob);
    activeBlobURLs.push(videoStream, thumbStream);

    mainVideo.src = videoStream;
    movieTitle.textContent = movie.title;
    movieCategory.textContent = movie.category;
    movieDescription.textContent = movie.description;

    if (movie.subsBlob) {
        const subsStream = URL.createObjectURL(movie.subsBlob);
        activeBlobURLs.push(subsStream);
        videoTrack.src = subsStream;
        videoTrack.mode = "showing";
    } else {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }

    mainVideo.load();
    mainVideo.play().catch(() => console.log("Buffering local browser binary video blocks..."));
}

function loadCatalogFromDB() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        renderGrid(getAllRequest.result);
    };
}

function renderGrid(moviesList) {
    movieGrid.innerHTML = '';
    if (moviesList.length === 0) {
        movieGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #555; padding: 40px 0;">No offline files stored in your local vault yet.</p>`;
        return;
    }

    moviesList.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // Render thumbnail graphic wrapper safely
        const tempThumbURL = URL.createObjectURL(movie.thumbBlob);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${tempThumbURL}" alt="Thumbnail">
            <button class="delete-movie-btn" data-id="${movie.id}">❌</button>
            <div class="movie-info">
                <div class="movie-card-title">${movie.title}</div>
                <div class="movie-card-cat">${movie.category}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(movie);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const deleteBtn = card.querySelector('.delete-movie-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${movie.title}" from your permanent browser vault?`)) {
                deleteMovieFromDB(movie.id);
            }
        });

        movieGrid.appendChild(card);
    });
}

function deleteMovieFromDB(id) {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => {
        loadCatalogFromDB();
    };
}

// 4. Input Authorization Controller Mechanics
const STEVENTV_SECRET = "admin123";

openAdminBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
    uploadForm.classList.add('hidden');
    adminAuthZone.classList.remove('hidden');
    adminPassInput.value = "";
    authErrorMsg.textContent = "";
});

closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));

btnAuthorize.addEventListener('click', () => {
    if (adminPassInput.value === STEVENTV_SECRET) {
        adminAuthZone.classList.add('hidden');
        uploadForm.classList.remove('hidden');
    } else {
        authErrorMsg.textContent = "Invalid Admin Key. Secure clearance denied.";
    }
});

// 5. Binary File Compilation Upload Engine
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const videoFiles = document.getElementById('form-video').files;
    const thumbFiles = document.getElementById('form-thumb').files;
    const subsFiles = document.getElementById('form-subtitles').files;

    if (videoFiles.length === 0 || thumbFiles.length === 0) {
        alert("Please make sure to select both a movie file and a poster artwork configuration block.");
        return;
    }

    // Capture files from the form inputs
    const videoBlob = videoFiles[0];
    const thumbBlob = thumbFiles[0];
    const subsBlob = subsFiles.length > 0 ? subsFiles[0] : null;

    const movieEntry = {
        id: "local-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value.trim(),
        description: document.getElementById('form-desc').value.trim(),
        videoBlob: videoBlob, // Saves raw movie binary data permanently onto your computer drive
        thumbBlob: thumbBlob, // Saves raw picture binary data permanently onto your computer drive
        subsBlob: subsBlob    // Saves raw text subtitle data permanently onto your computer drive
    };

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const addRequest = store.add(movieEntry);

    addRequest.onsuccess = () => {
        loadCatalogFromDB();
        targetMediaLoad(movieEntry);
        uploadForm.reset();
        adminModal.classList.remove('active');
    };

    addRequest.onerror = (err) => {
        alert("Database write error. Check if your computer has enough free space.");
        console.error(err);
    };
});

// 6. Realtime Filter Pipelines
searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        const matches = getAllRequest.result.filter(m => 
            m.title.toLowerCase().includes(term) || m.category.toLowerCase().includes(term)
        );
        renderGrid(matches);
    };
});
