// 1. Initialize IndexedDB Engine Settings (Permanent Local Database Binary Core)
const DB_NAME = "StevenTVPremiumDB";
const DB_VERSION = 3; 
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

const heroSlider = document.getElementById('hero-slider');
const heroSlideContainer = document.getElementById('hero-slide-container');
const heroPrev = document.getElementById('hero-prev');
const heroNext = document.getElementById('hero-next');
const heroDots = document.getElementById('hero-dots');

const gridAnime = document.getElementById('grid-anime');
const gridMovies = document.getElementById('grid-movies');
const gridTvShows = document.getElementById('grid-tvshows');
const emptyStateNotice = document.getElementById('empty-state-notice');

// TV Room Subcomponents Selectors
const tvSeriesRoom = document.getElementById('tv-series-room');
const seasonFilterBar = document.getElementById('season-filter-bar');
const episodeScrollerGrid = document.getElementById('episode-scroller-grid');

// Modals Nodes Layouts
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminAuthZone = document.getElementById('admin-auth-zone');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');
const formCategory = document.getElementById('form-category');
const seriesMetadataFields = document.getElementById('series-metadata-fields');

// Global Filtering Matrix State Counters
let currentSelectedLayout = "all";
let currentSelectedGenre = "all";

let currentSlideIndex = 0;
let slideInterval = null;
let activeStreams = [];
let cachedAllItems = []; 

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

formCategory.addEventListener('change', () => {
    if (formCategory.value === "TV Show" || formCategory.value === "Animation") {
        seriesMetadataFields.classList.remove('hidden');
    } else {
        seriesMetadataFields.classList.add('hidden');
    }
});

// 3. Central Media Deployment Router Engine
function targetMediaLoad(movie) {
    clearStreams();
    cinemaStage.classList.remove('hidden');
    
    if (movie.category === "TV Show" || movie.category === "Animation") {
        setupTvSeriesRoomConsole(movie);
    } else {
        tvSeriesRoom.classList.add('hidden');
    }

    executeDirectPlayback(movie);
    cinemaStage.scrollIntoView({ behavior: 'smooth' });
}

function executeDirectPlayback(episodeItem) {
    if (!episodeItem.videoBlob) return;
    
    const videoStream = URL.createObjectURL(episodeItem.videoBlob);
    activeStreams.push(videoStream);
    
    mainVideo.src = videoStream;
    cinemaTitle.textContent = episodeItem.title + (episodeItem.category !== "Movie" && episodeItem.category !== "Sport" ? ` - Season ${episodeItem.season} Ep ${episodeItem.episode}` : '');
    cinemaDescription.textContent = episodeItem.description;

    if (episodeItem.subsBlob) {
        const subsStream = URL.createObjectURL(episodeItem.subsBlob);
        activeStreams.push(subsStream);
        videoTrack.src = subsStream;
        videoTrack.mode = "showing";
    } else {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }

    mainVideo.load();
    mainVideo.play();
}

// 4. Series Hub Expansion Panel Logic Tree
function setupTvSeriesRoomConsole(activeItem) {
    tvSeriesRoom.classList.remove('hidden');
    seasonFilterBar.innerHTML = '';
    episodeScrollerGrid.innerHTML = '';

    const collection = cachedAllItems.filter(i => i.title.toLowerCase().trim() === activeItem.title.toLowerCase().trim());
    const seasonsList = [...new Set(collection.map(i => parseInt(i.season || 1)))].sort((a, b) => a - b);

    seasonsList.forEach((seasonNum, index) => {
        const btn = document.createElement('button');
        btn.className = `season-btn ${seasonNum === parseInt(activeItem.season || 1) ? 'active' : ''}`;
        btn.textContent = `Season ${seasonNum}`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderEpisodesForSeason(seasonNum, collection, activeItem.id);
        });
        seasonFilterBar.appendChild(btn);
    });

    renderEpisodesForSeason(parseInt(activeItem.season || 1), collection, activeItem.id);
}

function renderEpisodesForSeason(seasonNum, collection, activeId) {
    episodeScrollerGrid.innerHTML = '';
    
    const episodes = collection.filter(i => parseInt(i.season || 1) === seasonNum).sort((a, b) => parseInt(a.episode || 1) - parseInt(b.episode || 1));

    episodes.forEach(ep => {
        const pill = document.createElement('div');
        pill.className = `episode-item-pill ${ep.id === activeId ? 'active' : ''}`;
        pill.textContent = `Episode ${ep.episode}`;
        pill.title = ep.title;
        
        pill.addEventListener('click', () => {
            document.querySelectorAll('.episode-item-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            executeDirectPlayback(ep);
        });
        episodeScrollerGrid.appendChild(pill);
    });
}

closeCinemaBtn.addEventListener('click', () => {
    mainVideo.pause();
    cinemaStage.classList.add('hidden');
    tvSeriesRoom.classList.add('hidden');
    clearStreams();
});

// 5. Render Dashboard Rows Interface Channels 
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        cachedAllItems = getAllRequest.result;
        
        const sliderShowcase = [];
        const titlesSeen = new Set();
        
        [...cachedAllItems].reverse().forEach(item => {
            if (!titlesSeen.has(item.title.toLowerCase().trim())) {
                titlesSeen.add(item.title.toLowerCase().trim());
                sliderShowcase.push(item);
            }
        });

        buildHeroSlider(sliderShowcase.slice(0, 3)); 
        applyCombinedFilters();
    };
}

function applyCombinedFilters() {
    let filtered = cachedAllItems;

    if (currentSelectedLayout !== "all") {
        filtered = filtered.filter(item => item.category === currentSelectedLayout);
    }

    if (currentSelectedGenre !== "all") {
        filtered = filtered.filter(item => item.genre === currentSelectedGenre);
    }

    const rowPresentationItems = [];
    const trackingSet = new Set();

    filtered.forEach(item => {
        const signatureKey = `${item.title.toLowerCase().trim()}-${item.category}`;
        if (!trackingSet.has(signatureKey)) {
            trackingSet.add(signatureKey);
            rowPresentationItems.push(item);
        }
    });

    populateRows(rowPresentationItems);
}

function populateRows(items) {
    gridAnime.innerHTML = '';
    gridMovies.innerHTML = '';
    gridTvShows.innerHTML = '';

    let hasAnime = false, hasMovies = false, hasTv = false;

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const cardThumb = URL.createObjectURL(item.thumbBlob);
        activeStreams.push(cardThumb);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <span class="card-badge">FR</span>
            <button class="delete-movie-btn" data-id="${item.id}">✕</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div class="movie-card-cat">${item.genre || 'General'} • ${item.category}</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(item);
        });

        card.querySelector('.delete-movie-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove this asset entry for "${item.title}" from your StevenTV database?`)) {
                deleteItem(item.id);
            }
        });

        if (item.category === "Animation") { gridAnime.appendChild(card); hasAnime = true; }
        else if (item.category === "Movie") { gridMovies.appendChild(card); hasMovies = true; }
        else if (item.category === "TV Show") { gridTvShows.appendChild(card); hasTv = true; }
    });

    const sectionAnime = document.getElementById('section-anime');
    const sectionMovies = document.getElementById('section-movies');
    const sectionTvshows = document.getElementById('section-tvshows');

    sectionAnime.style.display = (hasAnime) ? 'block' : 'none';
    sectionMovies.style.display = (hasMovies) ? 'block' : 'none';

    sectionTvshows.style.display = (hasTv) ? 'block' : 'none';if (!hasAnime && !hasMovies && !hasTv) {emptyStateNotice.classList.remove('hidden');} else {emptyStateNotice.classList.add('hidden');}}// 6. Billboard Hero Carousel Slider Operations Mechanicsfunction buildHeroSlider(featuredItems) {heroSlideContainer.innerHTML = '';heroDots.innerHTML = '';clearInterval(slideInterval);if (featuredItems.length === 0) {heroSlider.style.display = 'none';return;}heroSlider.style.display = 'block';featuredItems.forEach((item, index) => {const slide = document.createElement('div');slide.className = slide-item ${index === 0 ? 'active' : ''};const bgUrl = URL.createObjectURL(item.thumbBlob);activeStreams.push(bgUrl);slide.style.backgroundImage = url('${bgUrl}');slide.innerHTML = <div class="slide-overlay"></div> <div class="slide-content"> <div class="slide-tag">💥 Featured ${item.category}</div> <h2 class="slide-title">${item.title}</h2> <div class="slide-meta">${item.genre || 'General'} • Audio: Français / English</div> <p style="color: #bbb; font-size:14px; margin-bottom:20px;">${item.description.slice(0, 140)}...</p> <button class="app-download-btn play-slide-btn" style="background-color:#00df89;">▶ Watch Now</button> </div>;slide.querySelector('.play-slide-btn').addEventListener('click', () => targetMediaLoad(item));heroSlideContainer.appendChild(slide);const dot = document.createElement('div');dot.className = dot ${index === 0 ? 'active' : ''};dot.addEventListener('click', () => showSlide(index));heroDots.appendChild(dot);});currentSlideIndex = 0;startAutoSlide();}function showSlide(index) {const slides = document.querySelectorAll('.slide-item');const dots = document.querySelectorAll('.dot');if (slides.length === 0) return;if (index >= slides.length) index = 0;if (index < 0) index = slides.length - 1;slides[currentSlideIndex].classList.remove('active');dots[currentSlideIndex].classList.remove('active');currentSlideIndex = index;slides[currentSlideIndex].classList.add('active');dots[currentSlideIndex].classList.add('active');}function startAutoSlide() {slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 6000);}heroNext.addEventListener('click', () => { showSlide(currentSlideIndex + 1); clearInterval(slideInterval); startAutoSlide(); });heroPrev.addEventListener('click', () => { showSlide(currentSlideIndex - 1); clearInterval(slideInterval); startAutoSlide(); });function deleteItem(id) {const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.delete(id).onsuccess = () => loadDashboard();}// 7. Security Panel Click Activation Mechanismconst STEVENTV_SECRET = "admin123";openAdminBtn.addEventListener('click', (e) => {e.preventDefault();adminModal.classList.add('active');uploadForm.classList.add('hidden');adminAuthZone.classList.remove('hidden');adminPassInput.value = "";authErrorMsg.textContent = "";});closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));btnAuthorize.addEventListener('click', () => {if (adminPassInput.value === STEVENTV_SECRET) {adminAuthZone.classList.add('hidden');uploadForm.classList.remove('hidden');} else {authErrorMsg.textContent = "Invalid StevenTV Console Key. Clearance denied.";}});uploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoFile = document.getElementById('form-video').files;const thumbFile = document.getElementById('form-thumb').files;const subsFile = document.getElementById('form-subtitles').files;if (!videoFile || !thumbFile) {alert("Please ensure video and thumbnail components are fully selected.");return;}const movieEntry = {id: "media-" + Date.now(),title: document.getElementById('form-title').value.trim(),category: document.getElementById('form-category').value,genre: document.getElementById('form-genre').value,season: document.getElementById('form-season').value || "1",episode: document.getElementById('form-episode').value || "1",description: document.getElementById('form-desc').value.trim(),videoBlob: videoFile,thumbBlob: thumbFile,subsBlob: subsFile || null};const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.add(movieEntry).onsuccess = () => {loadDashboard();uploadForm.reset();adminModal.classList.remove('active');alert("${movieEntry.title}" saved successfully to StevenTV!);};});// 8. Dual Matrix Filters Event Connectors (Sidebar Layouts + Genre Ribbon)document.querySelectorAll('.menu-item').forEach(item => {item.addEventListener('click', (e) => {if (item.id === "open-admin-btn") return;e.preventDefault();document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));item.classList.add('active');currentSelectedLayout = item.getAttribute('data-layout');if (currentSelectedLayout === "all" && currentSelectedGenre === "all") {heroSlider.style.display = 'block';} else {heroSlider.style.display = 'none';}applyCombinedFilters();});});document.querySelectorAll('.genre-pill').forEach(pill => {pill.addEventListener('click', () => {document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));pill.classList.add('active');currentSelectedGenre = pill.getAttribute('data-genre');if (currentSelectedLayout === "all" && currentSelectedGenre === "all") {heroSlider.style.display = 'block';} else {heroSlider.style.display = 'none';}applyCombinedFilters();});});searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();if (term === "") {applyCombinedFilters();return;}const matches = cachedAllItems.filter(m => m.title.toLowerCase().includes(term));populateRows(matches);});