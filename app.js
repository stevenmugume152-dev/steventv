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
    
    // Safety check ensuring file variants are unpacked from database blocks cleanly into streaming urls channels
    if (movieDataRecord.savedVideoBlobData instanceof File || movieDataRecord.savedVideoBlobData instanceof Blob) {
        const activeVideoTrackStream = URL.createObjectURL(movieDataRecord.savedVideoBlobData);
        globalRuntimeStreamURLsList.push(activeVideoTrackStream);
        theaterPlayer.src = activeVideoTrackStream;
    }
    
    theaterMovieTitle.textContent = movieDataRecord.title;
    theaterMovieDesc.textContent = `[Category: ${movieDataRecord.category}] — ${movieDataRecord.description}`;

    if (movieDataRecord.savedSubsBlobData && videoTrack && (movieDataRecord.savedSubsBlobData instanceof File || movieDataRecord.savedSubsBlobData instanceof Blob)) {
        const activeSubsTrackStream = URL.createObjectURL(movieDataRecord.savedSubsBlobData);
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

        let dynamicThumbStreamPath = "";
        if (item.savedThumbnailBlobData instanceof File || item.savedThumbnailBlobData instanceof Blob) {
            dynamicThumbStreamPath = URL.createObjectURL(item.savedThumbnailBlobData);
            globalRuntimeStreamURLsList.push(dynamicThumbStreamPath);
        }

        itemCard.innerHTML = `
            <img class="movie-thumbnail" src="${dynamicThumbStreamPath}">
            <button class="delete-record-btn" data-id="${item.id}">✕ Delete</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div style="font-size:11px; color:#00df89; font-weight:bold; margin-top:3px;">${item.category} ${item.savedSubsBlobData ? '• Subtitles Included' : ''}</div>
            </div>
        `;

        itemCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-record-btn')) return;
            bootVideoPlayback(item);
        });

        itemCard.querySelector('.delete-record-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${item.title}" from your offline vault?`)) {
                executeRecordPurge(item.id);
            }
        });

        catalogGridDisplay.appendChild(itemCard);
    });
}

function executeRecordPurge(recordTargetId) {
    const writeTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");
    writeTransaction.objectStore(STORAGE_STORE_NAME).delete(recordTargetId).onsuccess = () => {
        refreshCatalogDisplay();
    };
}

// 5. Interface Layout Modal Toggles & Requested Passcode Security Gate Check Loop
const STEVENTV_PASSCODE_SECRET = "muguTV123"; // Locked securely to your requested token

if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const userEnteredKey = prompt("Enter administrative passcode to unlock MuguTV configurations panel form:");
        
        if (userEnteredKey === STEVENTV_PASSCODE_SECRET) {
            if (uploadModalOverlay) uploadModalOverlay.classList.add('active');
        } else if (userEnteredKey !== null) {
            alert("Clearance Denied: Invalid password code entry sequence.");
        }
    });
}

if (exitModalBtn) {
    exitModalBtn.addEventListener('click', () => {
        if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');
    });
}

// 6. Form Storage Extraction Listener Routine (Unpacking files cleanly from FileLists arrays to clear clone errors)
if (mediaUploadForm) {
    mediaUploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const videoInputEl = document.getElementById('input-video-file');
        const subsInputEl = document.getElementById('input-subtitles-file');
        const thumbInputEl = document.getElementById('input-thumbnail-file');

        if (!videoInputEl || !videoInputEl.files || videoInputEl.files.length === 0 || !thumbInputEl || !thumbInputEl.files || thumbInputEl.files.length === 0) {
            alert("Please pick your target MP4 movie and cover thumbnail image components from your local drive storage.");
            return;
        }

        // Extracts single direct binary items out of FileList wrapper to clear clashing clone loops completely
        const targetVideoFile = videoInputEl.files[0];
        const targetImageFile = thumbInputEl.files[0];
        const targetSubsFile = (subsInputEl && subsInputEl.files && subsInputEl.files.length > 0) ? subsInputEl.files[0] : null;

        const movieDataEntryObject = {
            id: "mugu-media-" + Date.now(),
            title: document.getElementById('input-title').value.trim(),
            category: document.getElementById('input-category').value,
            savedVideoBlobData: targetVideoFile, 
            savedThumbnailBlobData: targetImageFile, 
            savedSubsBlobData: targetSubsFile, 
            description: document.getElementById('input-description').value.trim()
        };

        const saveTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");
        saveTransaction.objectStore(STORAGE_STORE_NAME).add(movieDataEntryObject).onsuccess = () => {
            refreshCatalogDisplay();
            mediaUploadForm.reset();
            if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');
            alert(`"${movieDataEntryObject.title}" has been saved permanently to your offline local MuguTV space drive library vault!`);
        };
        
        saveTransaction.onerror = () => alert("Storage threshold fault. Try uploading smaller file versions for best web browser performance.");
    });
}

// 7. Connect Sidebar Navigation Channels Filter Options Tabs Click Listeners Hooksdocument.querySelectorAll('.nav-item').forEach(buttonNode => {buttonNode.addEventListener('click', (e) => {if (buttonNode.id === "admin-toggle-btn") return;e.preventDefault();document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));buttonNode.classList.add('active');activeInterfaceFilter = buttonNode.getAttribute('data-filter') || "all";renderEcosystemCards();});});if (catalogSearch) {catalogSearch.addEventListener('input', (e) => {const searchTermString = e.target.value.toLowerCase().trim();if (searchTermString === "") {renderEcosystemCards();return;}const filteredMatchesPool = totalCachedCatalogItems.filter(item => {const matchesSearch = item.title && item.title.toLowerCase().includes(searchTermString);const matchesCategory = activeInterfaceFilter === "all" || item.category === activeInterfaceFilter;return matchesSearch && matchesCategory;});if (catalogGridDisplay) {catalogGridDisplay.innerHTML = '';filteredMatchesPool.forEach(item => {const searchItemCard = document.createElement('div');searchItemCard.className = 'movie-card';const dynamicThumbStreamPath = URL.createObjectURL(item.savedThumbnailBlobData);searchItemCard.innerHTML = <img class="movie-thumbnail" src="${dynamicThumbStreamPath}"><div class="movie-info"><div class="movie-card-title">${item.title}</div></div>;searchItemCard.addEventListener('click', () => bootVideoPlayback(item));catalogGridDisplay.appendChild(searchItemCard);});}});}