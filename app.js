// 1. Initialize Permanent Storage Database Environment Configuration Settings
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

// 2. Element Mappings Target Selectors Match Channels Nodes Elements
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

// Collapsible sidebar element navigation controls drawer elements
const appSidebar = document.getElementById('app-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

// MovieBox Split Resources Episode Dashboard Matrix Selectors Mapping Nodes
const movieboxSeriesResourcesBox = document.getElementById('moviebox-series-resources-box');
const movieboxSeasonTabs = document.getElementById('moviebox-season-tabs');
const movieboxEpisodesMatrix = document.getElementById('moviebox-episodes-matrix');

// Admin Modal overlays selectors configuration mapping data channels
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
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

// Sidebar toggle drawer listener
if (sidebarToggle && appSidebar) {
    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.app-container').classList.toggle('collapsed-sidebar');
    });
}

// Dynamically hide or show Episode details based on input selections
const formCategorySelect = document.getElementById('form-category');
const episodicMetadataFields = document.getElementById('episodic-metadata-fields');
if (formCategorySelect && episodicMetadataFields) {
    formCategorySelect.addEventListener('change', () => {
        if (formCategorySelect.value === "TV Show" || formCategorySelect.value === "Animation") {
            episodicMetadataFields.style.display = 'block';
        } else {
            episodicMetadataFields.style.display = 'none';
        }
    });
}

// 3. Central Media Deployment Router Engine
function targetMediaLoad(movie) {
    clearStreams();
    cinemaStage.classList.remove('hidden');
    
    // Safety check to handle file arrays vs single entries smoothly
    const singleMovieFile = Array.isArray(movie) ? movie[0] : movie;
    if (!singleMovieFile || !singleMovieFile.videoBlob) return;

    const videoFileBlob = (singleMovieFile.videoBlob instanceof FileList) ? singleMovieFile.videoBlob[0] : singleMovieFile.videoBlob;
    const videoStream = URL.createObjectURL(videoFileBlob);
    activeStreams.push(videoStream);
    mainVideo.src = videoStream;
    
    const dynamicEpisodeLabel = (singleMovieFile.category === "TV Show" || singleMovieFile.category === "Animation") ? ` S${singleMovieFile.season.toString().padStart(2,'0')} E${singleMovieFile.episode.toString().padStart(2,'0')}` : '';
    cinemaTitle.textContent = singleMovieFile.title + dynamicEpisodeLabel;
    cinemaDescription.textContent = singleMovieFile.description;

    if (singleMovieFile.subsBlob) {
        const subsFileBlob = (singleMovieFile.subsBlob instanceof FileList) ? singleMovieFile.subsBlob[0] : singleMovieFile.subsBlob;
        const subsStream = URL.createObjectURL(subsFileBlob);
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
    if (movieboxSeriesResourcesBox) movieboxSeriesResourcesBox.classList.add('hidden');
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
        
        const sliderShowcase = [];
        const titlesSeen = new Set();
        [...cachedAllItems].reverse().forEach(i => {
            if (i.title && !titlesSeen.has(i.title.toLowerCase().trim())) {
                titlesSeen.add(i.title.toLowerCase().trim());
                sliderShowcase.push(i);
            }
        });
        
        // FIXED: Corrected reference spelling to buildHeroSlider to resolve console crashes entirely
        buildHeroSlider(sliderShowcase.slice(0, 4)); 
        populateCarouselGrids(cachedAllItems);
        populateAdminDeletionTerminalList();
    };
}

function populateCarouselGrids(items) {
    gridAnime.innerHTML = '';
    gridMovies.innerHTML = '';
    gridTvShows.innerHTML = '';

    // ACCUMULATOR ROOM COMPILER MATRIX: Combines matching episode titles into unified folder rooms
    const folderGroupingsMap = {};
    items.forEach(item => {
        if (!item.title) return;
        const standardTitleKey = item.title.toLowerCase().trim();
        if (!folderGroupingsMap[standardTitleKey]) {
            folderGroupingsMap[standardTitleKey] = {
                baseProfileItem: item,
                episodesList: []
            };
        }
        folderGroupingsMap[standardTitleKey].episodesList.push(item);
    });

    Object.values(folderGroupingsMap).forEach(folder => {
        const data = folder.baseProfileItem;
        const episodesList = folder.episodesList;

        if (currentCategoryFilter !== "all" && data.category !== currentCategoryFilter) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const thumbFileBlob = (data.thumbBlob instanceof FileList) ? data.thumbBlob[0] : data.thumbBlob;
        const cardThumb = URL.createObjectURL(thumbFileBlob);
        activeStreams.push(cardThumb);
        
        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <div class="movie-info">
                <div class="movie-card-title">${data.title}</div>
            </div>
        `;

        card.addEventListener('click', () => handleRoomCardNavigationTrigger(data.title, episodesList));

        if (data.category === "Animation") gridAnime.appendChild(card);
        else if (data.category === "Movie") gridMovies.appendChild(card);
        else if (data.category === "TV Show") gridTvShows.appendChild(card);
    });

    document.getElementById('section-anime').style.display = gridAnime.children.length > 0 ? 'block' : 'none';
    document.getElementById('section-movies').style.display = gridMovies.children.length > 0 ? 'block' : 'none';
    document.getElementById('section-tvshows').style.display = gridTvShows.children.length > 0 ? 'block' : 'none';
}

function handleRoomCardNavigationTrigger(baseSeriesTitle, associatedEpisodesPool) {
    const checkItem = associatedEpisodesPool[0];
    const isSeriesLayoutType = checkItem.category === "TV Show" || checkItem.category === "Animation";
    
    if (isSeriesLayoutType && movieboxSeriesResourcesBox && movieboxSeasonTabs && movieboxEpisodesMatrix) {
        movieboxSeriesResourcesBox.classList.remove('hidden');
        movieboxSeasonTabs.innerHTML = '';
        movieboxEpisodesMatrix.innerHTML = '';

        const sortedSeasons = [...new Set(associatedEpisodesPool.map(i => parseInt(i.season || 1)))].sort((a,b) => a - b);

        sortedSeasons.forEach((seasonNum, index) => {
            const tabBtn = document.createElement('button');
            tabBtn.className = `season-pill-btn ${index === 0 ? 'active' : ''}`;
            tabBtn.textContent = `S${seasonNum.toString().padStart(2, '0')}`;
            
            tabBtn.addEventListener('click', () => {
document.querySelectorAll('.moviebox-season-tabs .season-pill-btn').forEach(b => b.classList.remove('active'));tabBtn.classList.add('active');renderEpisodesMatrixGrid(seasonNum, associatedEpisodesPool);});movieboxSeasonTabs.appendChild(tabBtn);});renderEpisodesMatrixGrid(sortedSeasons[0], associatedEpisodesPool);const initialEpisodes = associatedEpisodesPool.filter(i => parseInt(i.season || 1) === sortedSeasons[0]).sort((a,b) => parseInt(a.episode || 1) - parseInt(b.episode || 1));if (initialEpisodes.length > 0) targetMediaLoad(initialEpisodes[0]);} else {if (movieboxSeriesResourcesBox) movieboxSeriesResourcesBox.classList.add('hidden');targetMediaLoad(checkItem);}}function renderEpisodesMatrixGrid(seasonNumberValue, episodesPool) {movieboxEpisodesMatrix.innerHTML = '';const matchingEpisodes = episodesPool.filter(i => parseInt(i.season || 1) === seasonNumberValue).sort((a, b) => parseInt(a.episode || 1) - parseInt(b.episode || 1));matchingEpisodes.forEach((episodeFile) => {const epBtn = document.createElement('button');epBtn.className = 'episode-cell-btn';epBtn.textContent = episodeFile.episode.toString().padStart(2, '0');epBtn.addEventListener('click', () => {document.querySelectorAll('.moviebox-episodes-matrix .episode-cell-btn').forEach(b => b.classList.remove('active'));epBtn.classList.add('active');targetMediaLoad(episodeFile);});movieboxEpisodesMatrix.appendChild(epBtn);});}// Side scroller arrow listeners loop configurationdocument.querySelectorAll('.row-scroll-wrapper').forEach(wrapper => {const leftArrow = wrapper.querySelector('.left-arrow');const rightArrow = wrapper.querySelector('.right-arrow');const container = wrapper.querySelector('.row-scroll-container');if (leftArrow && rightArrow && container) {leftArrow.addEventListener('click', () => container.scrollLeft -= 240);rightArrow.addEventListener('click', () => container.scrollLeft += 240);}});// Billboard Hero Carousel Slider Operations Mechanicsfunction buildHeroSlider(featuredItems) {heroSlideContainer.innerHTML = '';heroDots.innerHTML = '';clearInterval(slideInterval);if (featuredItems.length === 0) {heroSlider.style.display = 'none';return;}heroSlider.style.display = 'block';featuredItems.forEach((item, index) => {const slide = document.createElement('div');slide.className = slide-item ${index === 0 ? 'active' : ''};const thumbFileBlob = (item.thumbBlob instanceof FileList) ? item.thumbBlob[0] : item.thumbBlob;const bgUrl = URL.createObjectURL(thumbFileBlob);activeStreams.push(bgUrl);slide.style.backgroundImage = url('${bgUrl}');slide.innerHTML = <div class="slide-overlay"></div> <div class="slide-content"> <div class="slide-tag">💥 Featured Spotlight</div> <h2 class="slide-title">${item.title}</h2> <p style="color:#bbb; font-size:14px; margin-bottom:15px;">${item.description.slice(0,140)}...</p> <button class="tab-btn" style="background:#00df89; color:#000; font-weight:bold; border:none; padding:10px 20px;">▶ Watch Features</button> </div>;slide.querySelector('button').addEventListener('click', () => {const matches = cachedAllItems.filter(i => i.title && i.title.toLowerCase().trim() === item.title.toLowerCase().trim());handleRoomCardNavigationTrigger(item.title, matches);});heroSlideContainer.appendChild(slide);const dot = document.createElement('div');dot.className = dot ${index === 0 ? 'active' : ''};dot.addEventListener('click', () => showSlide(index));heroDots.appendChild(dot);});currentSlideIndex = 0;slideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 6000);}function showSlide(index) {const slides = document.querySelectorAll('.slide-item');const dots = document.querySelectorAll('.dot');if (slides.length === 0) return;if (index >= slides.length) index = 0;if (index < 0) index = slides.length - 1;slides[currentSlideIndex].classList.remove('active');dots[currentSlideIndex].classList.remove('active');currentSlideIndex = index;slides[currentSlideIndex].classList.add('active');dots[currentSlideIndex].classList.add('active');}if (heroNext && heroPrev) {heroNext.addEventListener('click', () => showSlide(currentSlideIndex + 1));heroPrev.addEventListener('click', () => showSlide(currentSlideIndex - 1));}// Connected logic directly to the visible Admin button click listener hook channelconst STEVENTV_SECRET = "muguTV123";if (openAdminBtn) {openAdminBtn.addEventListener('click', (e) => {e.preventDefault();adminModal.classList.add('active');adminWorkspaceHub.classList.add('hidden');adminAuthZone.classList.remove('hidden');adminPassInput.value = "";authErrorMsg.textContent = "";});}if (closeAdminBtn) {closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));}if (btnAuthorize) {btnAuthorize.addEventListener('click', () => {if (adminPassInput.value === STEVENTV_SECRET) {adminAuthZone.classList.add('hidden');adminWorkspaceHub.classList.remove('hidden');toggleAdminTabs("upload");} else {authErrorMsg.textContent = "Clearance Denied. Key entry invalid.";}});}function toggleAdminTabs(tabName) {if (!tabBtnUpload || !tabBtnDelete || !uploadForm || !deletePanelView) return;if (tabName === "upload") {tabBtnUpload.classList.add('active'); tabBtnDelete.classList.remove('active');uploadForm.classList.remove('hidden'); deletePanelView.classList.add('hidden');} else {tabBtnDelete.classList.add('active'); tabBtnUpload.classList.remove('active');uploadForm.classList.add('hidden'); deletePanelView.classList.remove('hidden');populateAdminDeletionTerminalList();}}if (tabBtnUpload && tabBtnDelete) {tabBtnUpload.addEventListener('click', () => toggleAdminTabs("upload"));tabBtnDelete.addEventListener('click', () => toggleAdminTabs("delete"));}if (uploadForm) {uploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoInputFiles = document.getElementById('form-video').files;const thumbInputFiles = document.getElementById('form-thumb').files;const subsInputFiles = document.getElementById('form-subtitles').files;if (videoInputFiles.length === 0 || thumbInputFiles.length === 0) return;// ABSOLUTE PERSISTENCE PATTERN: Extracts single elements directly out of FileLists wrappers to store safely inside IndexedDB blocksconst movieEntry = {id: "media-box-id-" + Date.now(),title: document.getElementById('form-title').value.trim(),category: document.getElementById('form-category').value,season: parseInt(document.getElementById('form-season').value) || 1,episode: parseInt(document.getElementById('form-episode').value) || 1,description: document.getElementById('form-desc').value.trim(),videoBlob: videoInputFiles[0],thumbBlob: thumbInputFiles[0],subsBlob: subsInputFiles.length > 0 ? subsInputFiles[0] : null};const transaction = db.transaction([STORE_NAME], "readwrite");transaction.objectStore(STORE_NAME).add(movieEntry).onsuccess = () => {loadDashboard();uploadForm.reset();adminModal.classList.remove('active');alert("${movieEntry.title}" saved successfully to your permanent vault!);};});}function populateAdminDeletionTerminalList() {if (!adminDeletionScrollList) return;adminDeletionScrollList.innerHTML = '';if (cachedAllItems.length === 0) {adminDeletionScrollList.innerHTML = <p style="color:#858f99; font-size:12px; font-style:italic;">Vault is currently empty.</p>;return;}cachedAllItems.forEach(item => {const row = document.createElement('div');row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1c2229; padding:6px 12px; border-radius:6px; border:1px solid #28313b; margin-bottom:6px;";const detailsLabel = (item.category === "TV Show" || item.category === "Animation") ?  (S${item.season} E${item.episode}) : '';row.innerHTML = <div style="font-size:13px; font-weight:bold; color:white;">${item.title}${detailsLabel} <span style="font-size:10px; color:#858f99; font-weight:normal;">(${item.category})</span></div> <button style="background:#ff4a5a; color:white; border:none; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer;">✕ Erase</button>;row.querySelector('button').addEventListener('click', () => {if (confirm(Erase "${item.title}" permanently from StevenTV catalog?)) {const transaction = db.transaction([STORE_NAME], "readwrite");transaction.objectStore(STORE_NAME).delete(item.id).onsuccess = () => loadDashboard();}});adminDeletionScrollList.appendChild(row);});}document.querySelectorAll('.menu-item').forEach(item => {item.addEventListener('click', (e) => {if (item.id === "open-admin-btn") return;e.preventDefault();document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));item.classList.add('active');currentCategoryFilter = item.getAttribute('data-layout');if (currentCategoryFilter === "all") { heroSlider.style.display = 'block'; }else { heroSlider.style.display = 'none'; }populateCarouselGrids(cachedAllItems);});});if (searchBar) {searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();const filteredMatches = cachedAllItems.filter(m => m.title && m.title.toLowerCase().includes(term));populateCarouselGrids(filteredMatches);});}