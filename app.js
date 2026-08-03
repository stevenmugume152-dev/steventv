// 1. Initialize Permanent IndexedDB Offline Drive Storage Configuration Settings
const DATABASE_NAME = "MuguTVPermanentVaultDB";
const DATABASE_VERSION = 1;
const STORAGE_STORE_NAME = "mugutv_library";
let localDatabaseConnection = null;

const dbRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

dbRequest.onupgradeneeded = (event) => {
    let targetDb = event.target.result;
    if (!targetDb.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        targetDb.createObjectStore(STORAGE_STORE_NAME, { keyPath: "id" });
    }
};

dbRequest.onsuccess = (event) => {
    localDatabaseConnection = event.target.result;
    refreshCatalogDisplay();
};

// 2. Element DOM Target Mappings Selectors Mapping Locations Elements
const theaterPlayer = document.getElementById('theater-player');
const videoTrack = document.getElementById('video-track');
const videoTheaterStage = document.getElementById('video-theater-stage');
const theaterMovieTitle = document.getElementById('theater-movie-title');
const theaterMovieDesc = document.getElementById('theater-movie-desc');
const closeTheaterBtn = document.getElementById('close-theater-btn');
const catalogSearch = document.getElementById('catalog-search');
const catalogGridDisplay = document.getElementById('catalog-grid-display');
const currentGridHeaderTitle = document.getElementById('current-grid-header-title');
const emptyNoticeBox = document.getElementById('empty-notice-box');

// Modal Elements Target Selectors Mapping Elements
const uploadModalOverlay = document.getElementById('upload-modal-overlay');
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const exitModalBtn = document.getElementById('exit-modal-btn');
const mediaUploadForm = document.getElementById('media-upload-form');

let totalCachedCatalogItems = [];
let activeInterfaceFilter = "all";
let globalRuntimeStreamURLsList = [];

function flushActiveRuntimeStreams() {
    globalRuntimeStreamURLsList.forEach(url => URL.revokeObjectURL(url));
    globalRuntimeStreamURLsList = [];
}

// 3. Central Media Playback Core Routine
function bootVideoPlayback(movieDataRecord) {
    flushActiveRuntimeStreams();
    if (!videoTheaterStage || !theaterPlayer) return;

    videoTheaterStage.classList.remove('hidden');
    
    let videoFile = null;
    if (movieDataRecord.savedVideoBlobData instanceof File || movieDataRecord.savedVideoBlobData instanceof Blob) {
        videoFile = movieDataRecord.savedVideoBlobData;
    } else if (movieDataRecord.savedVideoBlobData instanceof FileList && movieDataRecord.savedVideoBlobData.length > 0) {
        videoFile = movieDataRecord.savedVideoBlobData[0];
    } else if (movieDataRecord.savedVideoBlobData && movieDataRecord.savedVideoBlobData[0]) {
        videoFile = movieDataRecord.savedVideoBlobData[0];
    }

    if (videoFile) {
        const activeVideoTrackStream = URL.createObjectURL(videoFile);
        globalRuntimeStreamURLsList.push(activeVideoTrackStream);
        theaterPlayer.src = activeVideoTrackStream;
    }
    
    theaterMovieTitle.textContent = movieDataRecord.title;
    theaterMovieDesc.textContent = movieDataRecord.description || "";

    let subsFile = null;
    if (movieDataRecord.savedSubsBlobData instanceof File || movieDataRecord.savedSubsBlobData instanceof Blob) {
        subsFile = movieDataRecord.savedSubsBlobData;
    } else if (movieDataRecord.savedSubsBlobData instanceof FileList && movieDataRecord.savedSubsBlobData.length > 0) {
        subsFile = movieDataRecord.savedSubsBlobData[0];
    } else if (movieDataRecord.savedSubsBlobData && movieDataRecord.savedSubsBlobData[0]) {
        subsFile = movieDataRecord.savedSubsBlobData[0];
    }

    if (subsFile && videoTrack) {
        const activeSubsTrackStream = URL.createObjectURL(subsFile);
        globalRuntimeStreamURLsList.push(activeSubsTrackStream);
        videoTrack.src = activeSubsTrackStream;
        videoTrack.mode = "showing";
    } else if (videoTrack) {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }

    theaterPlayer.load();
    theaterPlayer.play().catch(err => console.warn("Interaction required for playback:", err));
    videoTheaterStage.scrollIntoView({ behavior: 'smooth' });
}

if (closeTheaterBtn) {
    closeTheaterBtn.addEventListener('click', () => {
        if (theaterPlayer) theaterPlayer.pause();
        if (videoTheaterStage) videoTheaterStage.classList.add('hidden');
        flushActiveRuntimeStreams();
    });
}

// 4. Grid Presentation Generator Layout Rows Pipelines
function refreshCatalogDisplay() {
    if (!localDatabaseConnection) return;
    const readTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readonly");
    const databaseFetchQuery = readTransaction.objectStore(STORAGE_STORE_NAME).getAll();

    databaseFetchQuery.onsuccess = () => {
        totalCachedCatalogItems = databaseFetchQuery.result || [];
        renderEcosystemCards();
        populateAdminDeletionList();
    };
}

function renderEcosystemCards() {
    if (!catalogGridDisplay || !currentGridHeaderTitle || !emptyNoticeBox) return;
    catalogGridDisplay.innerHTML = '';

    let itemsToDisplay = totalCachedCatalogItems;
    if (activeInterfaceFilter !== "all") {
        itemsToDisplay = totalCachedCatalogItems.filter(i => i.category === activeInterfaceFilter);
        currentGridHeaderTitle.textContent = `Browsing Category: ${activeInterfaceFilter} Selection`;
    } else {
        currentGridHeaderTitle.textContent = "Home Catalog — All Uploaded Features";
    }

    if (itemsToDisplay.length === 0) {
        emptyNoticeBox.classList.remove('hidden');
        return;
    } else {
        emptyNoticeBox.classList.add('hidden');
    }

    itemsToDisplay.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'movie-card';

        let thumbFile = null;
        if (item.savedThumbnailBlobData instanceof File || item.savedThumbnailBlobData instanceof Blob) {
            thumbFile = item.savedThumbnailBlobData;
        } else if (item.savedThumbnailBlobData instanceof FileList && item.savedThumbnailBlobData.length > 0) {
            thumbFile = item.savedThumbnailBlobData[0];
        } else if (item.savedThumbnailBlobData && item.savedThumbnailBlobData[0]) {
            thumbFile = item.savedThumbnailBlobData[0];
        }

        let dynamicThumbStreamPath = "";
        if (thumbFile) {
            dynamicThumbStreamPath = URL.createObjectURL(thumbFile);
            globalRuntimeStreamURLsList.push(dynamicThumbStreamPath);
        }

        const standardHasSubs = item.savedSubsBlobData && (
            item.savedSubsBlobData instanceof File || 
            item.savedSubsBlobData instanceof Blob || 
            (item.savedSubsBlobData instanceof FileList && item.savedSubsBlobData.length > 0) ||
            item.savedSubsBlobData[0]
        );

        itemCard.innerHTML = `
            <img class="movie-thumbnail" src="${dynamicThumbStreamPath}">
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div style="font-size:11px; color:#00df89; font-weight:bold; margin-top:3px;">${item.category} ${standardHasSubs ? '• Subtitles' : ''}</div>
            </div>
        `;

        itemCard.addEventListener('click', () => {
            bootVideoPlayback(item);
        });

        catalogGridDisplay.appendChild(itemCard);
    });
}

// 5. Secure Admin Delete Section Generator Logic Block
function populateAdminDeletionList() {
    const deletionWrapper = document.getElementById('admin-deletion-zone-list');
    if (!deletionWrapper) return;
    deletionWrapper.innerHTML = '';

    if (totalCachedCatalogItems.length === 0) {
        deletionWrapper.innerHTML = `<p style="color:#858f99; font-size:12px; font-style:italic; padding:5px;">Your database is empty.</p>`;
        return;
    }

    totalCachedCatalogItems.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1c2229; padding:8px 12px; border-radius:6px; border:1px solid #28313b; margin-bottom:8px;";
        
        row.innerHTML = `
            <div style="font-size:13px; font-weight:bold; color:white;">${item.title} <span style="font-size:10px; color:#858f99; font-weight:normal;">(${item.category})</span></div>
            <button style="background:#ff4a5a; color:white; border:none; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer;">✕ Erase</button>
        `;
        
        row.querySelector('button').addEventListener('click', () => {
            if (confirm(`Are you absolutely sure you want to delete "${item.title}" permanently from MuguTV?`)) {
                const writeTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");
                writeTransaction.objectStore(STORAGE_STORE_NAME).delete(item.id).onsuccess = () => {
                    refreshCatalogDisplay();
                };
            }
        });
        deletionWrapper.appendChild(row);
    });
}

// 6. Interface Layout Modal Toggles & Requested Passcode Security Gate Check Loop
const STEVENTV_PASSCODE_SECRET = "muguTV123";

if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const userEnteredKey = prompt("Enter administrative passcode to unlock MuguTV configurations panel form:");
        
        if (userEnteredKey === STEVENTV_PASSCODE_SECRET) {
            if (uploadModalOverlay) uploadModalOverlay.classList.add('active');
            populateAdminDeletionList();
        } else if (userEnteredKey !== null) {
            alert("Clearance Denied: Invalid password code entry sequence.");
        }
    });
}

if (exitModalBtn) {
    exitModalBtn.addEventListener('click', () => {
if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');});}// 7. Form Storage Extraction Listener Routineif (mediaUploadForm) {mediaUploadForm.addEventListener('submit', (e) => {e.preventDefault();const videoInputEl = document.getElementById('input-video-file');const subsInputEl = document.getElementById('input-subtitles-file');const thumbInputEl = document.getElementById('input-thumbnail-file');if (!videoInputEl || !videoInputEl.files || videoInputEl.files.length === 0 || !thumbInputEl || !thumbInputEl.files || thumbInputEl.files.length === 0) {alert("Please pick your target MP4 movie and cover thumbnail image components from your local drive storage.");return;}const movieDataEntryObject = {id: "mugu-media-" + Date.now(),title: document.getElementById('input-title').value.trim(),category: document.getElementById('input-category').value,savedVideoBlobData: videoInputEl.files,savedThumbnailBlobData: thumbInputEl.files,savedSubsBlobData: (subsInputEl && subsInputEl.files && subsInputEl.files.length > 0) ? subsInputEl.files : null,description: document.getElementById('input-description').value.trim()};const saveTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");saveTransaction.objectStore(STORAGE_STORE_NAME).add(movieDataEntryObject).onsuccess = () => {refreshCatalogDisplay();mediaUploadForm.reset();if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');alert("${movieDataEntryObject.title}" has been saved permanently to your offline local MuguTV library vault!);};saveTransaction.onerror = () => alert("Storage issue: Try a smaller file size.");});}// 8. Sidebar Connect Layout Filtering Hooksdocument.querySelectorAll('.nav-item').forEach(buttonNode => {buttonNode.addEventListener('click', (e) => {if (buttonNode.id === "admin-toggle-btn") return;e.preventDefault();document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));buttonNode.classList.add('active');activeInterfaceFilter = buttonNode.getAttribute('data-filter') || "all";renderEcosystemCards();});});if (catalogSearch) {catalogSearch.addEventListener('input', (e) => {const searchTermString = e.target.value.toLowerCase().trim();if (searchTermString === "") {renderEcosystemCards();return;}const filteredMatchesPool = totalCachedCatalogItems.filter(item => {const matchesSearch = item.title && item.title.toLowerCase().includes(searchTermString);const matchesCategory = activeInterfaceFilter === "all" || item.category === activeInterfaceFilter;return matchesSearch && matchesCategory;});if (catalogGridDisplay) {catalogGridDisplay.innerHTML = '';filteredMatchesPool.forEach(item => {const searchItemCard = document.createElement('div');searchItemCard.className = 'movie-card';let fileRef = item.savedThumbnailBlobData;let singleFile = (fileRef instanceof FileList && fileRef.length > 0) ? fileRef[0] : fileRef;if (fileRef && fileRef[0]) singleFile = fileRef[0];let dynamicThumbStreamPath = (singleFile instanceof File || singleFile instanceof Blob) ? URL.createObjectURL(singleFile) : "";searchItemCard.innerHTML = <img class="movie-thumbnail" src="${dynamicThumbStreamPath}"><div class="movie-info"><div class="movie-card-title">${item.title}</div></div>;searchItemCard.addEventListener('click', () => bootVideoPlayback(item));catalogGridDisplay.appendChild(searchItemCard);});}});}