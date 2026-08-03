// 1. Initialize IndexedDB Engine Settings (Permanent Local Storage Setup Core)
const DB_NAME = "StevenTVPremiumDB";
const DB_VERSION = 4; 
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
const emptyStateBanner = document.getElementById('empty-state-banner');

// Top Slider Billboard Elements Match Selectors Mapping
const billboardSliderZone = document.getElementById('billboard-slider-zone');
const heroBillboard = document.getElementById('hero-billboard');
const billboardTitle = document.getElementById('billboard-title');
const billboardDesc = document.getElementById('billboard-desc');
const billboardPlayBtn = document.getElementById('billboard-play-btn');
const slideNextBtn = document.getElementById('slide-next-btn');
const slidePrevBtn = document.getElementById('slide-prev-btn');

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
let autoSliderTimer = null;

function clearStreams() {
    activeStreams.forEach(url => URL.revokeObjectURL(url));
    activeStreams = [];
}

// 3. Central Media Deployment Streaming Router Media Player Direct Control Matrix Blocks
function targetMediaLoad(movie) {
    clearStreams();
    if (!movie || !cinemaStage || !mainVideo) return;
    
    cinemaStage.classList.remove('hidden');
    
    // Resolve single item vs collection array extraction mapping layers smoothly
    const singleMovie = Array.isArray(movie) ? movie[0] : movie;
    if (!singleMovie || !singleMovie.videoBlob) return;

    // Convert file entries into active source streams
    const videoStream = URL.createObjectURL(singleMovie.videoBlob);
    activeStreams.push(videoStream);
    mainVideo.src = videoStream;
    
    if (cinemaTitle) cinemaTitle.textContent = singleMovie.title;
    if (cinemaDescription) cinemaDescription.textContent = singleMovie.description;

    if (singleMovie.subsBlob && videoTrack) {
        const subsStream = URL.createObjectURL(singleMovie.subsBlob);
        activeStreams.push(subsStream);
        videoTrack.src = subsStream;
        videoTrack.mode = "showing";
    } else if (videoTrack) {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }

    mainVideo.load();
    mainVideo.play();
    cinemaStage.scrollIntoView({ behavior: 'smooth' });
}

// Media Player Inline Buttons Execution Direct Listeners Loop Mapping
if (playerBtnPlay && playerBtnPause && playerBtnRewind && playerBtnForward) {
    playerBtnPlay.addEventListener('click', () => mainVideo && mainVideo.play());
    playerBtnPause.addEventListener('click', () => mainVideo && mainVideo.pause());
    playerBtnRewind.addEventListener('click', () => { if(mainVideo) mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 10); });
    playerBtnForward.addEventListener('click', () => { if(mainVideo) mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 10); });
}

if (closeCinemaBtn) {
    closeCinemaBtn.addEventListener('click', () => {
        if (mainVideo) mainVideo.pause();
        if (cinemaStage) cinemaStage.classList.add('hidden');
        if (tvSeriesRoomHub) tvSeriesRoomHub.classList.add('hidden');
        clearStreams();
    });
}

// 4. Render Dashboard data pipelines and Accumulator Aggregator Series Box Room Mapping Logic
function loadDashboard() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        cachedItems = getAllRequest.result || [];
        
        // Build Billboard Hero Slideshow queue arrays using the latest unique titles uploaded
        const uniqueSliderTracking = new Set();
        sliderShowcaseItems = [];
        [...cachedItems].reverse().forEach(i => {
            if (i.title && !uniqueSliderTracking.has(i.title.toLowerCase().trim())) {
                uniqueSliderTracking.add(i.title.toLowerCase().trim());
                sliderShowcaseItems.push(i);
            }
        });
        
        currentSliderIndex = 0;
        updateSliderBillboardDisplay();
        startAutoSliderRotation();
        renderFilteredGrid();
        populateAdminDeletionTerminalList();
    };
}

// Auto slider update display logic block loop with background intervals transitions
function updateSliderBillboardDisplay() {
    if (!billboardSliderZone || !billboardTitle || !billboardDesc || !heroBillboard || !billboardPlayBtn) return;
    if (sliderShowcaseItems.length === 0) {
        billboardSliderZone.style.display = 'none';
        return;
    }
    billboardSliderZone.style.display = 'block';
    
    const activeSlide = sliderShowcaseItems[currentSliderIndex];
    billboardTitle.textContent = activeSlide.title;
    billboardDesc.textContent = activeSlide.description ? (activeSlide.description.slice(0, 140) + "...") : "";
    
    if (activeSlide.thumbBlob) {
        const billboardBG = URL.createObjectURL(activeSlide.thumbBlob);
        activeStreams.push(billboardBG);
        heroBillboard.style.backgroundImage = `linear-gradient(rgba(12,15,18,0.2), #0c0f12), url('${billboardBG}')`;
    }
    
    billboardPlayBtn.onclick = () => {
        handleMediaCardClickRouting(activeSlide.title, activeSlide);
    };
}

function startAutoSliderRotation() {
    clearInterval(autoSliderTimer);
    if (sliderShowcaseItems.length <= 1) return;
    autoSliderTimer = setInterval(() => {
        currentSliderIndex = (currentSliderIndex + 1) % sliderShowcaseItems.length;
        updateSliderBillboardDisplay();
    }, 5000); 
}

if (slideNextBtn && slidePrevBtn) {
    slideNextBtn.addEventListener('click', () => {
        if (sliderShowcaseItems.length === 0) return;
        currentSliderIndex = (currentSliderIndex + 1) % sliderShowcaseItems.length;
        updateSliderBillboardDisplay();
        startAutoSliderRotation(); 
    });
    slidePrevBtn.addEventListener('click', () => {
        if (sliderShowcaseItems.length === 0) return;
        currentSliderIndex = (currentSliderIndex - 1 + sliderShowcaseItems.length) % sliderShowcaseItems.length;
        updateSliderBillboardDisplay();
        startAutoSliderRotation(); 
    });
}

function renderFilteredGrid() {
    if (!gridMovies || !rowDynamicTitle || !emptyStateBanner) return;
    gridMovies.innerHTML = '';
    
    let displayItems = cachedItems;
    if (currentCategoryFilter !== "all") {
        displayItems = cachedItems.filter(item => item.category === currentCategoryFilter);
        rowDynamicTitle.textContent = `Browsing Collection: ${currentCategoryFilter}s`;
    } else {
        rowDynamicTitle.textContent = "Home Catalog — All Uploaded Features";
    }

    if (displayItems.length === 0) {
        emptyStateBanner.classList.remove('hidden');
        return;
    } else {
        emptyStateBanner.classList.add('hidden');
    }

    // Groups all separate files with matching names inside a unified array folder
    const uniqueRoomsAccumulatorMap = {};
    
    displayItems.forEach(item => {
        if (!item.title) return;
        const standardTitleKey = item.title.toLowerCase().trim();
        if (!uniqueRoomsAccumulatorMap[standardTitleKey]) {
            uniqueRoomsAccumulatorMap[standardTitleKey] = {
                baseProfile: item,
                allEpisodesCollectionList: []
            };
        }
        uniqueRoomsAccumulatorMap[standardTitleKey].allEpisodesCollectionList.push(item);
    });

Object.values(uniqueRoomsAccumulatorMap).forEach(room => {const primaryData = room.baseProfile;const totalEpisodesCount = room.allEpisodesCollectionList.length;const card = document.createElement('div');card.className = 'movie-card';if (primaryData.thumbBlob) {const cardThumb = URL.createObjectURL(primaryData.thumbBlob);activeStreams.push(cardThumb);const isSeries = (primaryData.category === "TV Show" || primaryData.category === "Animation") && totalEpisodesCount > 1;const subLabelText = isSeries ? 🗂️ Series Room Folder (${totalEpisodesCount} Videos) : ${primaryData.category || 'Movie'};card.innerHTML = <img class="movie-thumbnail" src="${cardThumb}"> <div class="movie-info"> <div class="movie-card-title">${primaryData.title}</div> <div style="font-size:11px; color:#00df89; margin-top:3px; font-weight:bold;">${subLabelText}</div> </div>;}card.addEventListener('click', () => {handleMediaCardClickRouting(primaryData.title, primaryData);});gridMovies.appendChild(card);});}function handleMediaCardClickRouting(baseTitleString, singleItemFallbackObject) {if (!baseTitleString) return;const episodePool = cachedItems.filter(i => i.title && i.title.toLowerCase().trim() === baseTitleString.toLowerCase().trim());if (episodePool.length > 1 && tvSeriesRoomHub && episodeSelectionScroller) {tvSeriesRoomHub.classList.remove('hidden');episodeSelectionScroller.innerHTML = '';episodePool.forEach((episodeFile, idx) => {const pill = document.createElement('button');pill.className = 'control-pills-btn';pill.style.background = '#1c2229';pill.style.color = '#fff';pill.style.border = '1px solid #28313b';pill.style.marginRight = '5px';pill.textContent = 📺 Episode [${idx + 1}];pill.addEventListener('click', () => {document.querySelectorAll('.tv-series-room-hub .control-pills-btn').forEach(b => {b.style.background = '#1c2229';b.style.color = '#fff';});pill.style.background = '#00df89';pill.style.color = '#000';targetMediaLoad(episodeFile);});episodeSelectionScroller.appendChild(pill);});targetMediaLoad(episodePool[0]);} else {if (tvSeriesRoomHub) tvSeriesRoomHub.classList.add('hidden');targetMediaLoad(singleItemFallbackObject);}}function populateAdminDeletionTerminalList() {if (!adminDeletionScrollList) return;adminDeletionScrollList.innerHTML = '';if (cachedItems.length === 0) {adminDeletionScrollList.innerHTML = <p style="color:#858f99; font-size:12px; font-style:italic; padding:10px;">No video records present inside the active storage vault blocks to remove.</p>;return;}cachedItems.forEach(item => {const row = document.createElement('div');row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1c2229; padding:8px 12px; border-radius:6px; border:1px solid #28313b; margin-bottom:8px;";row.innerHTML = <div style="font-size:13px; font-weight:bold; color:white;">${item.title} <span style="font-size:10px; color:#858f99; font-weight:normal; margin-left:5px;">(${item.category || 'Movie'})</span></div> <button style="background:#ff4a5a; color:white; border:none; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer;">Erase From Drive</button>;row.querySelector('button').addEventListener('click', () => {if (confirm(Are you absolutely sure you want to delete this file entry for "${item.title}" permanently from StevenTV?)) {const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.delete(item.id).onsuccess = () => {loadDashboard();};}});adminDeletionScrollList.appendChild(row);});}// 5. Security Panel Gateway Controllers & Interface Switch Hooksconst STEVENTV_SECRET = "admin123";if (openAdminBtn) {openAdminBtn.addEventListener('click', (e) => {e.preventDefault();if (adminModal) adminModal.classList.add('active');if (adminConsoleLayoutHub) adminConsoleLayoutHub.classList.add('hidden');const authZone = document.getElementById('admin-auth-zone');if (authZone) authZone.classList.remove('hidden');if (adminPassInput) adminPassInput.value = "";if (authErrorMsg) authErrorMsg.textContent = "";});}if (closeAdminBtn) {closeAdminBtn.addEventListener('click', () => adminModal && adminModal.classList.remove('active'));}if (btnAuthorize) {btnAuthorize.addEventListener('click', () => {if (adminPassInput && adminPassInput.value === STEVENTV_SECRET) {const authZone = document.getElementById('admin-auth-zone');if (authZone) authZone.classList.add('hidden');if (adminConsoleLayoutHub) adminConsoleLayoutHub.classList.remove('hidden');showAdminTabFormSection("upload");} else if (authErrorMsg) {authErrorMsg.textContent = "Invalid Admin Key. Clearance Denied.";}});}function showAdminTabFormSection(viewName) {if (!tabTriggerUpload || !tabTriggerDelete || !uploadForm || !deleteManagementPanelView) return;if (viewName === "upload") {tabTriggerUpload.style.background = "#00df89"; tabTriggerUpload.style.color = "#000";tabTriggerDelete.style.background = "#1c2229"; tabTriggerDelete.style.color = "#fff";uploadForm.classList.remove('hidden');deleteManagementPanelView.classList.add('hidden');} else {tabTriggerDelete.style.background = "#00df89"; tabTriggerDelete.style.color = "#000";tabTriggerUpload.style.background = "#1c2229"; tabTriggerUpload.style.color = "#fff";uploadForm.classList.add('hidden');deleteManagementPanelView.classList.remove('hidden');populateAdminDeletionTerminalList();}}if (tabTriggerUpload && tabTriggerDelete) {tabTriggerUpload.addEventListener('click', () => showAdminTabFormSection("upload"));tabTriggerDelete.addEventListener('click', () => showAdminTabFormSection("delete"));}if (uploadForm) {uploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoFilesList = document.getElementById('form-video').files;const thumbFilesList = document.getElementById('form-thumb').files;const subsFilesList = document.getElementById('form-subtitles').files;if (!videoFilesList || videoFilesList.length === 0 || !thumbFilesList || thumbFilesList.length === 0) {alert("Please ensure both video assets and thumbnail cards are specified properly.");return;}// FIXED: Extract the raw file binaries directly out of the FileList index array wrapperconst movieEntry = {id: "media-" + Date.now(),title: document.getElementById('form-title').value.trim(),category: document.getElementById('form-category').value,description: document.getElementById('form-desc').value.trim(),videoBlob: videoFilesList[0], // Extract raw file item binary data directlythumbBlob: thumbFilesList[0], // Extract raw file item binary data directlysubsBlob: (subsFilesList && subsFilesList.length > 0) ? subsFilesList[0] : null};const transaction = db.transaction([STORE_NAME], "readwrite");const store = transaction.objectStore(STORE_NAME);store.add(movieEntry).onsuccess = () => {loadDashboard();uploadForm.reset();if (adminModal) adminModal.classList.remove('active');alert("${movieEntry.title}" has been saved permanently inside your browser hard drive vault blocks safely!);};transaction.onerror = (err) => {console.error("Storage transactional fault:", err);alert("Failed to write to your local storage workspace thresholds.");};});}// 6. Connect Sidebar Filtering Navigation Click Hooks Channelsdocument.querySelectorAll('.menu-item').forEach(btn => {btn.addEventListener('click', (e) => {if (btn.id === "open-admin-btn") return;e.preventDefault();document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));btn.classList.add('active');currentCategoryFilter = btn.getAttribute('data-filter') || "all";renderFilteredGrid();});});if (searchBar) {searchBar.addEventListener('input', (e) => {const term = e.target.value.toLowerCase().trim();if (term === "") {renderFilteredGrid();return;}const baseSet = currentCategoryFilter === "all" ? cachedItems : cachedItems.filter(i => i.category === currentCategoryFilter);const matches = baseSet.filter(m => m.title && m.title.toLowerCase().includes(term));if (gridMovies) {gridMovies.innerHTML = '';matches.forEach(item => {const card = document.createElement('div'); card.className = 'movie-card';if (item.thumbBlob) {const cardThumb = URL.createObjectURL(item.thumbBlob);card.innerHTML = <img class="movie-thumbnail" src="${cardThumb}"><div class="movie-info"><div class="movie-card-title">${item.title}</div></div>;}card.addEventListener('click', () => targetMediaLoad(item));gridMovies.appendChild(card);});}});}