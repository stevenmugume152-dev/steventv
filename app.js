// 1. Initialize Permanent Storage Database Environment
const DB_NAME = "StevenTVMovieBoxVaultDB";
const DB_VERSION = 1;
const STORE_NAME = "media_vault";
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

// 2. Element Mappings Selectors Match Channels Nodes
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

// Collapsible sidebar element drawer selectors
const appSidebar = document.getElementById('app-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

// Admin Modal overlays selectors mapping
const adminModal = document.getElementById('admin-modal');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminAuthZone = document.getElementById('admin-auth-zone');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const adminWorkspaceHub = document.getElementById('admin-workspace-hub');
const uploadForm = document.getElementById('upload-form');
const deletePanelView = document.getElementById('delete-panel-view');
const adminDeletionScrollList = document.getElementById('admin-deletion-scroll-list');
const tabBtnUpload = document.getElementById('tab-btn-upload');
const tabBtnDelete = document.getElementById('tab-btn-delete');

let currentSlideIndex = 0;
let slideInterval = null;
let activeStreams = [];
let cachedAllItems = [];
let currentCategoryFilter = "all";

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// Sidebar responsive layout collapsing drawer toggle trigger listener
if (sidebarToggle && appSidebar) {
    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.app-container').classList.toggle('collapsed-sidebar');
    });
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

// 4. Render Dashboard data loops layout layers
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        cachedAllItems = getAllRequest.result || [];
        buildHeroSlider(cachedAllItems.slice(-4)); // Places latest 4 entries into top banner rotation slider
        populateCarouselGrids(cachedAllItems);
        populateAdminDeletionTerminalList();
    };
}

function populateCarouselGrids(items) {
    gridAnime.innerHTML = '';
    gridMovies.innerHTML = '';
    gridTvShows.innerHTML = '';

    let hasAnime = false, hasMovies = false, hasTv = false;
    let filteredList = currentCategoryFilter === "all" ? items : items.filter(i => i.category === currentCategoryFilter);

    filteredList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const cardThumb = URL.createObjectURL(item.thumbBlob);
        activeStreams.push(cardThumb);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
            </div>
        `;

        card.addEventListener('click', () => targetMediaLoad(item));

        if (item.category === "Animation") { gridAnime.appendChild(card); hasAnime = true; }
        else if (item.category === "Movie") { gridMovies.appendChild(card); hasMovies = true; }
        else if (item.category === "TV Show") { gridTvShows.appendChild(card); hasTv = true; }
    });

    document.getElementById('section-anime').style.display = hasAnime ? 'block' : 'none';
    document.getElementById('section-movies').style.display = hasMovies ? 'block' : 'none';
    document.getElementById('section-tvshows').style.display = hasTv ? 'block' : 'none';
}

// Wire up the side navigation scrolling row arrow click triggers explicitly
document.querySelectorAll('.row-scroll-wrapper').forEach(wrapper => {
    const leftArrow = wrapper.querySelector('.left-arrow');
    const rightArrow = wrapper.querySelector('.right-arrow');
    const container = wrapper.querySelector('.row-scroll-container');
    
    if (leftArrow && rightArrow && container) {
        leftArrow.addEventListener('click', () => container.scrollLeft -= 240);
        rightArrow.addEventListener('click', () => container.scrollLeft += 240);
    }
});

// 5. Billboard Hero Carousel Slider Mechanics (Image 1)
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
        
        const bgUrl = URL.createObjectURL(item.thumbBlob);
        activeStreams.push(bgUrl);
        slide.style.backgroundImage = `url('${bgUrl}')`;
        
        slide.innerHTML = `
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <div class="slide-tag">💥 Featured Spotlight</div>
                <h2 class="slide-title">${item.title}</h2>
                <p style="color:#bbb; font-size:14px; margin-bottom:15px;">${item.description.slice(0,140)}...</p>
                <button class="tab-btn" id="hero-play-click-${index}" style="background:#00df89; color:#000; font-weight:bold; border:none; padding:10px 20px;">▶ Watch Features</button>
            </div>
        `;

        slide.querySelector('button').addEventListener('click', () => targetMediaLoad(item));
        heroSlideContainer.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => showSlide(index));
        heroDots.appendChild(dot);
    });

    currentSlideIndex = 0;
    slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 6000);
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

if (heroNext && heroPrev) {
    heroNext.addEventListener('click', () => showSlide(currentSlideIndex + 1));
    heroPrev.addEventListener('click', () => showSlide(currentSlideIndex - 1));
}

// 6. Security Panel Hidden Gate Trigger Control loops (Shift Key Double Tap)
const STEVENTV_SECRET = "muguTV123";
let lastShiftTapTime = 0;

window.addEventListener('keydown', (e) => {
    if (e.key === "Shift") {
        const currentTime = new Date().getTime();
        if (currentTime - lastShiftTapTime < 500 && currentTime - lastShiftTapTime > 0) {
            e.preventDefault();
            adminModal.classList.add('active');
            adminWorkspaceHub.classList.add('hidden');
            adminAuthZone.classList.remove('hidden');
            adminPassInput.value = "";
            authErrorMsg.textContent = "";
        }
        lastShiftTapTime = currentTime;
    }
});

closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));

btnAuthorize.addEventListener('click', () => {
    if (adminPassInput.value === STEVENTV_SECRET) {
        adminAuthZone.classList.add('hidden');
        adminWorkspaceHub.classList.remove('hidden');
        toggleAdminTabs("upload");
    } else {
authErrorMsg.textContent = "Clearance Denied. Key entry invalid.";}});function toggleAdminTabs(tabName) {if (tabName === "upload") {tabBtnUpload.classList.add('active'); tabBtnDelete.classList.remove('active');uploadForm.classList.remove('hidden'); deletePanelView.classList.add('hidden');} else {tabBtnDelete.classList.add('active'); tabBtnUpload.classList.remove('active');uploadForm.classList.add('hidden'); deletePanelView.classList.remove('hidden');populateAdminDeletionTerminalList();}}tabBtnUpload.addEventListener('click', () => toggleAdminTabs("upload"));tabBtnDelete.addEventListener('click', () => toggleAdminTabs("delete"));uploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoInput = document.getElementById('form-video').files;const thumbInput = document.getElementById('form-thumb').files;const subsInput = document.getElementById('form-subtitles').files;if (!videoInput || !thumbInput) return;// DIRECT ITEM EXTRACOR BINARY SCHEMAS: Extracts exact single raw components out of wrappers to preserve file storage forever safelyconst movieEntry = {id: "media-box-id-" + Date.now(),title: document.getElementById('form-title').value.trim(),category: document.getElementById('form-category').value,description: document.getElementById('form-desc').value.trim(),videoBlob: videoInput,thumbBlob: thumbInput,subsBlob: subsInput ? subsInput : null};const transaction = db.transaction([STORE_NAME], "readwrite");transaction.objectStore(STORE_NAME).add(movieEntry).onsuccess = () => {loadDashboard();uploadForm.reset();adminModal.classList.remove('active');alert("${movieEntry.title}" has been saved permanently to your offline StevenTV server hard drive vaults!);};});function populateAdminDeletionTerminalList() {adminDeletionScrollList.innerHTML = '';if (cachedAllItems.length === 0) {adminDeletionScrollList.innerHTML = <p style="color:#858f99; font-size:12px; font-style:italic;">Vault is currently empty.</p>;return;}cachedAllItems.forEach(item => {const row = document.createElement('div');row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1c2229; padding:6px 12px; border-radius:6px; border:1px solid #28313b; margin-bottom:6px;";row.innerHTML = <div style="font-size:13px; font-weight:bold; color:white;">${item.title} <span style="font-size:10px; color:#858f99; font-weight:normal;">(${item.category})</span></div> <button style="background:#ff4a5a; color:white; border:none; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer;">✕ Erase</button>;row.querySelector('button').addEventListener('click', () => {if (confirm(Erase "${item.title}" permanently from StevenTV catalog?)) {const transaction = db.transaction([STORE_NAME], "readwrite");transaction.objectStore(STORE_NAME).delete(item.id).onsuccess = () => loadDashboard();}});adminDeletionScrollList.appendChild(row);});}// 7. Sidebar Dynamic Category Filters Events Wire Hooks Connectionsdocument.querySelectorAll('.menu-item').forEach(item => {item.addEventListener('click', (e) => {e.preventDefault();document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));item.classList.add('active');currentCategoryFilter = item.getAttribute('data-layout');// Hide large hero banner slider when browsing specific layout rows channels explicitlyif (currentCategoryFilter === "all") { heroSlider.style.display = 'block'; }else { heroSlider.style.display = 'none'; }populateCarouselGrids(cachedAllItems);});});searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();const filteredMatches = cachedAllItems.filter(m => m.title.toLowerCase().includes(term));populateCarouselGrids(filteredMatches);});