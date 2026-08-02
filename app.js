// 1. Initialize IndexedDB Database Engine Settings
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
const videoTrack = document.getElementById('video-track');
const cinemaStage = document.getElementById('cinema-stage');
const cinemaTitle = document.getElementById('cinema-title');
const cinemaDescription = document.getElementById('cinema-description');
const closeCinemaBtn = document.getElementById('close-cinema-btn');
const searchBar = document.getElementById('search-bar');

const heroSlider = document.getElementById('hero-slider');
const heroSlideContainer = document.getElementById('hero-slide-container');
const heroPrev = document.getElementById('hero-prev');
const heroNext = document.getElementById('hero-next');
const heroDots = document.getElementById('hero-dots');

const gridAnime = document.getElementById('grid-anime');
const gridMovies = document.getElementById('grid-movies');
const gridTvShows = document.getElementById('grid-tvshows');

// Modals Nodes
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminAuthZone = document.getElementById('admin-auth-zone');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');

let currentSlideIndex = 0;
let slideInterval = null;
let activeStreams = [];

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// 3. Central Media Deployment Router Engine
function targetMediaLoad(movie) {
    clearStreams();
    cinemaStage.classList.remove('hidden');
    
    const videoStream = URL.createObjectURL(movie.videoBlob);
    activeStreams.push(videoStream);
    
    mainVideo.src = videoStream;
    cinemaTitle.textContent = movie.title;
    cinemaDescription.textContent = movie.description;

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

// 4. Render Dashboard and Rows Interface Channels
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        const allItems = getAllRequest.result;
        buildHeroSlider(allItems.slice(-3)); // Show the latest 3 items in the banner
        populateRows(allItems);
    };
}

function populateRows(items) {
    // Clear out standard grid templates containers channels
    gridAnime.innerHTML = '';
    gridMovies.innerHTML = '';
    gridTvShows.innerHTML = '';

    let hasAnime = false, hasMovies = false, hasTv = false;

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const cardThumb = URL.createObjectURL(item.thumbBlob);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <span class="card-badge">FR</span>
            <button class="delete-movie-btn" data-id="${item.id}">✕</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div class="movie-card-cat">2026 • ${item.category}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(item);
        });

        card.querySelector('.delete-movie-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${item.title}" from your StevenTV database?`)) {
                deleteItem(item.id);
            }
        });

        // Route item to its matching horizontal row layout channel
        if (item.category === "Animation") { gridAnime.appendChild(card); hasAnime = true; }
        else if (item.category === "Movie") { gridMovies.appendChild(card); hasMovies = true; }
        else if (item.category === "TV Show") { gridTvShows.appendChild(card); hasTv = true; }
    });

    // Hide or show row blocks depending on database data
    document.getElementById('section-anime').style.display = hasAnime ? 'block' : 'none';
    document.getElementById('section-movies').style.display = hasMovies ? 'block' : 'none';
    document.getElementById('section-tvshows').style.display = hasTv ? 'block' : 'none';
}

// 5. Billboard Hero Carousel Slider Operations Mechanics
function buildHeroSlider(featuredItems) {
    heroSlideContainer.innerHTML = '';
    heroDots.innerHTML = '';
    clearInterval(slideInterval);

    if (featuredItems.length === 0) {
        heroSlider.style.display = 'none';
        return;
    }
    heroSlider.style.display = 'block';

    featuredItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = `slide-item ${index === 0 ? 'active' : ''}`;
        
        // Use poster block data as slider background layout cover
        const bgUrl = URL.createObjectURL(item.thumbBlob);
        slide.style.backgroundImage = `url('${bgUrl}')`;
        
        slide.innerHTML = `
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <div class="slide-tag">💥 Featured ${item.category}</div>
                <h2 class="slide-title">${item.title}</h2>
                <div class="slide-meta">Audio: Français / English • Subtitles Active</div>
                <p style="color: #bbb; font-size:14px; margin-bottom:20px;">${item.description.slice(0, 140)}...</p>
                <button class="app-download-btn play-slide-btn" style="background-color:#00df89;">▶ Watch Now</button>
            </div>
        `;

        slide.querySelector('.play-slide-btn').addEventListener('click', () => targetMediaLoad(item));
        heroSlideContainer.appendChild(slide);

        // Generate matching selector dots controls indicators
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => showSlide(index));
        heroDots.appendChild(dot);
    });

    currentSlideIndex = 0;
    startAutoSlide();
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide-item');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');

    currentSlideIndex = index;

    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function startAutoSlide() {
    slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 6000);
}

heroNext.addEventListener('click', () => { showSlide(currentSlideIndex + 1); clearInterval(slideInterval); startAutoSlide(); });
heroPrev.addEventListener('click', () => { showSlide(currentSlideIndex - 1); clearInterval(slideInterval); startAutoSlide(); });

function deleteItem(id) {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id).onsuccess = () => loadDashboard();
}

// 6. Security Panel & Selection Hooks Controller Mechanics
const STEVENTV_SECRET = "admin123";

openAdminBtn.addEventListener('click', (e) => { 
    e.preventDefault(); 
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
        authErrorMsg.textContent = "Invalid StevenTV Console Key. Clearance denied."; 
    }
});

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const videoFiles = document.getElementById('form-video').files[0];
    const thumbFiles = document.getElementById('form-thumb').files[0];
    const subsFiles = document.getElementById('form-subtitles').files[0];

    const movieEntry = {
        id: "media-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value,
        description: document.getElementById('form-desc').value.trim(),
        videoBlob: videoFiles,
        thumbBlob: thumbFiles,
        subsBlob: subsFiles || null
    };

    const transaction = db.transaction([STORE_NAME], "readwrite");

    const store = transaction.objectStore(STORE_NAME);store.add(movieEntry).onsuccess = () => {loadDashboard();targetMediaLoad(movieEntry);uploadForm.reset();adminModal.classList.remove('active');};});// 7. Sidebar Category Menu Filters and Top Bar Searchdocument.querySelectorAll('.menu-item').forEach(item => {item.addEventListener('click', (e) => {if(item.id === "open-admin-btn") return;document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));item.classList.add('active');const cat = item.getAttribute('data-category');const transaction = db.transaction([STORE_NAME], "readonly");const getAllRequest = transaction.objectStore(STORE_NAME).getAll();getAllRequest.onsuccess = () => {const items = getAllRequest.result;if (cat === "all") {populateRows(items);heroSlider.style.display = 'block';} else {const filtered = items.filter(i => i.category === cat);populateRows(filtered);heroSlider.style.display = 'none'; // Hide billboard hero when browsing specific rows}};});});searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();const transaction = db.transaction([STORE_NAME], "readonly");const getAllRequest = transaction.objectStore(STORE_NAME).getAll();getAllRequest.onsuccess = () => {const matches = getAllRequest.result.filter(m => m.title.toLowerCase().includes(term));populateRows(matches);};});