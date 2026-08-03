// 1. Initialize IndexedDB Core Persistent Database Architecture Engine Settings
const DB_NAME = "StevenTVPremiumDB";
const DB_VERSION = 4; // Version matches your current schema to protect all existing video data
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

// 2. Element Selectors Mapping Layouts Channels Nodes Elements
const mainVideo = document.getElementById('main-video');
const videoTrack = document.getElementById('video-track');
const cinemaStage = document.getElementById('cinema-stage');
const cinemaTitle = document.getElementById('cinema-title');
const cinemaDescription = document.getElementById('cinema-description');
const closeCinemaBtn = document.getElementById('close-cinema-btn');
const searchBar = document.getElementById('search-bar');
const gridMovies = document.getElementById('grid-movies');
const rowDynamicTitle = document.getElementById('row-dynamic-title');

// Top Slider Billboard Elements Match Selectors Mapping
const billboardSliderZone = document.getElementById('billboard-slider-zone');
const heroBillboard = document.getElementById('hero-billboard');
const billboardTitle = document.getElementById('billboard-title');
const billboardDesc = document.getElementById('billboard-desc');
const billboardPlayBtn = document.getElementById('billboard-play-btn');
const slidePrevBtn = document.getElementById('slide-prev-btn');
const slideNextBtn = document.getElementById('slide-next-btn');

// TV Episodes Hub Room Subsystem Nodes Panels Channels
const tvSeriesRoomHub = document.getElementById('tv-series-room-hub');
const episodeSelectionScroller = document.getElementById('episode-selection-scroller');

// Modals Nodes Administrative Settings Layouts Mapping
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');
const adminConsoleLayoutHub = document.getElementById('admin-console-layout-hub');

const tabTriggerUpload = document.getElementById('tab-trigger-upload');
const tabTriggerDelete = document.getElementById('tab-trigger-delete');
const deleteManagementPanelView = document.getElementById('delete-management-panel-view');
const adminDeletionScrollList = document.getElementById('admin-deletion-scroll-list');

// Direct Interactive Control Buttons Selectors Mapping
const playerBtnPlay = document.getElementById('player-btn-play');
const playerBtnPause = document.getElementById('player-btn-pause');
const playerBtnRewind = document.getElementById('player-btn-rewind');
const playerBtnForward = document.getElementById('player-btn-forward');

// Global System Variables Engine Metrics Counters
let activeStreams = [];
let cachedItems = [];
let sliderShowcaseItems = [];
let currentSliderIndex = 0;
let currentCategoryFilter = "all";

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// 3. Central Media Deployment Streaming Router Media Player Direct Control Matrix Blocks
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

// Media Player Inline Buttons Execution Direct Listeners Loop Mapping
playerBtnPlay.addEventListener('click', () => mainVideo.play());
playerBtnPause.addEventListener('click', () => mainVideo.pause());
playerBtnRewind.addEventListener('click', () => { mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 10); });
playerBtnForward.addEventListener('click', () => { mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 10); });

closeCinemaBtn.addEventListener('click', () => {
    mainVideo.pause();
    cinemaStage.classList.add('hidden');
    tvSeriesRoomHub.classList.add('hidden');
    clearStreams();
});

// 4. Render Dashboard data pipelines and Accumulator Aggregator Series Box Room Mapping Logic
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        cachedItems = getAllRequest.result;
        
        // Build Billboard Hero Slideshow queue arrays using the latest unique titles uploaded
        const uniqueSliderTracking = new Set();
        sliderShowcaseItems = [];
        [...cachedItems].reverse().forEach(i => {
            if (!uniqueSliderTracking.has(i.title.toLowerCase().trim())) {
                uniqueSliderTracking.add(i.title.toLowerCase().trim());
                sliderShowcaseItems.push(i);
            }
        });
        
        currentSliderIndex = 0;
        updateSliderBillboardDisplay();
        renderFilteredGrid();
        populateAdminDeletionTerminalList();
    };
}

// Auto slider update display logic block loop
function updateSliderBillboardDisplay() {
    if (!billboardSliderZone) return;
    if (sliderShowcaseItems.length === 0) {
        billboardSliderZone.style.display = 'none';
        return;
    }
    billboardSliderZone.style.display = 'block';
    
    const activeSlide = sliderShowcaseItems[currentSliderIndex];
    billboardTitle.textContent = activeSlide.title;
    billboardDesc.textContent = activeSlide.description.slice(0, 160) + "...";
    
    const billboardBG = URL.createObjectURL(activeSlide.thumbBlob);
    activeStreams.push(billboardBG);
    heroBillboard.style.backgroundImage = `linear-gradient(rgba(12,15,18,0.3), #0c0f12), url('${billboardBG}')`;
    
    // Wire up the prominent Play slider button channel hook directly
    billboardPlayBtn.onclick = () => {
        handleMediaCardClickRouting(activeSlide.title, activeSlide);
    };
}

if (slideNextBtn && slidePrevBtn) {
    slideNextBtn.addEventListener('click', () => {
        if (sliderShowcaseItems.length === 0) return;
        currentSliderIndex = (currentSliderIndex + 1) % sliderShowcaseItems.length;
        updateSliderBillboardDisplay();
    });
    slidePrevBtn.addEventListener('click', () => {
        if (sliderShowcaseItems.length === 0) return;
        currentSliderIndex = (currentSliderIndex - 1 + sliderShowcaseItems.length) % sliderShowcaseItems.length;
        updateSliderBillboardDisplay();
    });
}

function renderFilteredGrid() {
    gridMovies.innerHTML = '';
    
    let displayItems = cachedItems;
    if (currentCategoryFilter !== "all") {
        displayItems = cachedItems.filter(item => item.category === currentCategoryFilter);
        rowDynamicTitle.textContent = `Browsing Collection: ${currentCategoryFilter}s`;
    } else {
        rowDynamicTitle.textContent = "Your Movie Catalog Presentation Board";
    }

    if (displayItems.length === 0) {
        gridMovies.innerHTML = `<p style="padding: 20px; color:#858f99; font-style:italic;">No media uploads available in this classification tier section yet.</p>`;
        return;
    }

    // ACCUMULATOR ROOM MECHANICS: Groups all individual episode files sharing identical titles into one room card
    const uniqueRoomsAccumulatorMap = {};
    
    displayItems.forEach(item => {
        const standardTitleKey = item.title.toLowerCase().trim();
        if (!uniqueRoomsAccumulatorMap[standardTitleKey]) {
            uniqueRoomsAccumulatorMap[standardTitleKey] = {
                baseProfile: item,
                allEpisodesCollectionList: []
            };
        }
        uniqueRoomsAccumulatorMap[standardTitleKey].allEpisodesCollectionList.push(item);
    });

    // Loop through our clean grouped array maps to render exactly ONE unified title block room card slot channel
    Object.values(uniqueRoomsAccumulatorMap).forEach(room => {
        const primaryData = room.baseProfile;
        const totalEpisodesCount = room.allEpisodesCollectionList.length;
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        const cardThumb = URL.createObjectURL(primaryData.thumbBlob);
        activeStreams.push(cardThumb);
        
        // Show indicator if card represents a multi-episode Series room hub
        const isSeries = (primaryData.category === "TV Show" || primaryData.category === "Animation") && totalEpisodesCount > 1;
        const subLabelText = isSeries ? `🗂️ Series Hub Room (${totalEpisodesCount} Videos)` : `${primaryData.category || 'Movie'}`;

        card.innerHTML = `
            <img class="movie-thumbnail" src="${cardThumb}">
            <div class="movie-info">
                <div class="movie-card-title">${primaryData.title}</div>
                <div style="font-size:11px; color:#00df89; margin-top:3px; font-weight:bold;">${subLabelText}</div>
            </div>
        `;

        card.addEventListener('click', () => {

            handleMediaCardClickRouting(primaryData.title, primaryData);});gridMovies.appendChild(card);});}// Clean unified routing calculation branch blockfunction handleMediaCardClickRouting(baseTitleString, singleItemFallbackObject) {const episodePool = cachedItems.filter(i => i.title.toLowerCase().trim() === baseTitleString.toLowerCase().trim());if (episodePool.length > 1) {// Expand the custom unified series room navigation grid bartvSeriesRoomHub.classList.remove('hidden');episodeSelectionScroller.innerHTML = '';episodePool.forEach((episodeFile, idx) => {const pill = document.createElement('button');pill.className = 'control-pills-btn';pill.style.background = '#1c2229';pill.style.color = '#fff';pill.style.border = '1px solid #28313b';pill.style.marginRight = '5px';pill.textContent = 📺 Episode [${idx + 1}];pill.addEventListener('click', () => {document.querySelectorAll('.tv-series-room-hub .control-pills-btn').forEach(b => {b.style.background = '#1c2229';b.style.color = '#fff';});pill.style.background = '#00df89';pill.style.color = '#000';targetMediaLoad(episodeFile);});episodeSelectionScroller.appendChild(pill);});// Trigger initial video load using slot 1 file data automaticallytargetMediaLoad(episodePool[0]);} else {tvSeriesRoomHub.classList.add('hidden');targetMediaLoad(singleItemFallbackObject);}}// 5. Dedicated Administrative Deletion Terminal Render Systemfunction populateAdminDeletionTerminalList() {if (!adminDeletionScrollList) return;adminDeletionScrollList.innerHTML = '';if (cachedItems.length === 0) {adminDeletionScrollList.innerHTML = <p style="color:#858f99; font-size:12px; font-style:italic;">No records present to purge.</p>;return;}cachedItems.forEach(item => {const row = document.createElement('div');row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1c2229; padding:8px 12px; border-radius:6px; border:1px solid #28313b; margin-bottom:8px;";row.innerHTML = <div style="font-size:13px; font-weight:bold; color:white;">${item.title} <span style="font-size:10px; color:#858f99; font-weight:normal; margin-left:5px;">(${item.category})</span></div> <button style="background:#ff4a5a; color:white; border:none; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer;">Erase</button>;row.querySelector('button').addEventListener('click', () => {if (confirm(Are you absolutely sure you want to delete this specific file entry for "${item.title}"?)) {const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.delete(item.id).onsuccess = () => {loadDashboard();};}});adminDeletionScrollList.appendChild(row);});}// 6. Security Panel Gateway Controllers & Interface Switch Hooksconst STEVENTV_SECRET = "admin123";openAdminBtn.addEventListener('click', (e) => {e.preventDefault();adminModal.classList.add('active');adminConsoleLayoutHub.classList.add('hidden');document.getElementById('admin-auth-zone').classList.remove('hidden');adminPassInput.value = "";authErrorMsg.textContent = "";});closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));btnAuthorize.addEventListener('click', () => {if (adminPassInput.value === STEVENTV_SECRET) {document.getElementById('admin-auth-zone').classList.add('hidden');adminConsoleLayoutHub.classList.remove('hidden');showAdminTabFormSection("upload");} else {authErrorMsg.textContent = "Invalid Admin Key.";}});function showAdminTabFormSection(viewName) {if (viewName === "upload") {tabTriggerUpload.style.background = "#00df89"; tabTriggerUpload.style.color = "#000";tabTriggerDelete.style.background = "#1c2229"; tabTriggerDelete.style.color = "#fff";uploadForm.classList.remove('hidden');deleteManagementPanelView.classList.add('hidden');} else {tabTriggerDelete.style.background = "#00df89"; tabTriggerDelete.style.color = "#000";tabTriggerUpload.style.background = "#1c2229"; tabTriggerUpload.style.color = "#fff";uploadForm.classList.add('hidden');deleteManagementPanelView.classList.remove('hidden');populateAdminDeletionTerminalList();}}tabTriggerUpload.addEventListener('click', () => showAdminTabFormSection("upload"));tabTriggerDelete.addEventListener('click', () => showAdminTabFormSection("delete"));uploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoInput = document.getElementById('form-video').files[0];const thumbInput = document.getElementById('form-thumb').files[0];const subsInput = document.getElementById('form-subtitles').files[0];if (!videoInput || !thumbInput) {alert("Please ensure both video assets and thumbnail cards are specified properly.");return;}const movieEntry = {id: "media-" + Date.now(),title: document.getElementById('form-title').value.trim(),category: document.getElementById('form-category').value,description: document.getElementById('form-desc').value.trim(),videoBlob: videoInput,thumbBlob: thumbInput,subsBlob: subsInput || null};const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.add(movieEntry).onsuccess = () => {loadDashboard();uploadForm.reset();adminModal.classList.remove('active');alert("${movieEntry.title}" has been saved permanently inside your browser hard drive vault blocks!);};});// 7. Connect Sidebar Filtering Navigation Click Hooks Channelsdocument.querySelectorAll('.menu-item').forEach(btn => {btn.addEventListener('click', (e) => {if (btn.id === "open-admin-btn") return;e.preventDefault();document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));btn.classList.add('active');currentCategoryFilter = btn.getAttribute('data-filter');renderFilteredGrid();});});searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();if (term === "") {renderFilteredGrid();return;}const baseSet = currentCategoryFilter === "all" ? cachedItems : cachedItems.filter(i => i.category === currentCategoryFilter);const matches = baseSet.filter(m => m.title.toLowerCase().includes(term));gridMovies.innerHTML = '';matches.forEach(item => {const card = document.createElement('div'); card.className = 'movie-card';const cardThumb = URL.createObjectURL(item.thumbBlob);card.innerHTML = <img class="movie-thumbnail" src="${cardThumb}"><div class="movie-info"><div class="movie-card-title">${item.title}</div></div>;card.addEventListener('click', () => targetMediaLoad(item));gridMovies.appendChild(card);});});