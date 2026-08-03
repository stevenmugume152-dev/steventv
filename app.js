// 1. Initialize Permanent Storage Core System
const DATABASE_NAME = "StevenTVEasyVaultDB";
const DATABASE_VERSION = 1;
const STORAGE_STORE_NAME = "steventv_catalog";
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

// 2. Element DOM Target Mappings Selectors
const theaterPlayer = document.getElementById('theater-player');
const videoTheaterStage = document.getElementById('video-theater-stage');
const theaterMovieTitle = document.getElementById('theater-movie-title');
const theaterMovieDesc = document.getElementById('theater-movie-desc');
const closeTheaterBtn = document.getElementById('close-theater-btn');
const catalogSearch = document.getElementById('catalog-search');
const catalogGridDisplay = document.getElementById('catalog-grid-display');
const currentGridHeaderTitle = document.getElementById('current-grid-header-title');
const emptyNoticeBox = document.getElementById('empty-notice-box');

// Modal Elements Target Selectors Mapping
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
    theaterPlayer.src = movieDataRecord.videoUrlPathString;
    
    theaterMovieTitle.textContent = movieDataRecord.title;
    theaterMovieDesc.textContent = `[Category: ${movieDataRecord.category}] — ${movieDataRecord.description}`;

    theaterPlayer.load();
    theaterPlayer.play().catch(err => {
        console.warn("Autoplay block trigger. User click required:", err);
    });
    videoTheaterStage.scrollIntoView({ behavior: 'smooth' });
}

if (closeTheaterBtn) {
    closeTheaterBtn.addEventListener('click', () => {
        if (theaterPlayer) theaterPlayer.pause();
        if (videoTheaterStage) videoTheaterStage.classList.add('hidden');
        flushActiveRuntimeStreams();
    });
}

// 4. Grid Presentation Generator Layout
function refreshCatalogDisplay() {
    if (!localDatabaseConnection) return;
    const readTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readonly");
    const targetStore = readTransaction.objectStore(STORAGE_STORE_NAME);
    const databaseFetchQuery = targetStore.getAll();

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

        // Reconstruct saved raw thumbnail images back into runtime graphic layers
        const dynamicThumbStreamPath = URL.createObjectURL(item.savedThumbnailBlobData);
        globalRuntimeStreamURLsList.push(dynamicThumbStreamPath);

        itemCard.innerHTML = `
            <img class="movie-thumbnail" src="${dynamicThumbStreamPath}">
            <button class="delete-record-btn" data-id="${item.id}">✕ Delete</button>
            <div class="movie-info">
                <div class="movie-card-title">${item.title}</div>
                <div style="font-size:11px; color:#858f99; margin-top:3px;">${item.category}</div>
            </div>
        `;

        itemCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-record-btn')) return;
            bootVideoPlayback(item);
        });

        itemCard.querySelector('.delete-record-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${item.title}" from StevenTV permanently?`)) {
                executeRecordPurge(item.id);
            }
        });

        catalogGridDisplay.appendChild(itemCard);
    });
}

function executeRecordPurge(recordTargetId) {
    const writeTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");
    const writeStore = writeTransaction.objectStore(STORAGE_STORE_NAME);
    writeStore.delete(recordTargetId).onsuccess = () => {
        refreshCatalogDisplay();
    };
}

// 5. Interface Layout Modal Action Toggles & Passcode Security Gateway
const STEVENTV_PASSCODE_SECRET = "admin123";

if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Prompt the user for credentials before launching the modal frame channel
        const userEnteredKey = prompt("Enter administrative passcode to unlock StevenTV uploads:");
        
        if (userEnteredKey === STEVENTV_PASSCODE_SECRET) {
            if (uploadModalOverlay) uploadModalOverlay.classList.add('active');
        } else if (userEnteredKey !== null) {
            alert("Clearance Denied: Invalid administrative passcode key entry.");
        }
    });
}

if (exitModalBtn) {
    exitModalBtn.addEventListener('click', () => {
        if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');
    });
}

// 6. Form Storage Extraction Listener Routine (Safe Extraction Loop Architecture)
if (mediaUploadForm) {
    mediaUploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleField = document.getElementById('input-title').value.trim();
        const categoryField = document.getElementById('input-category').value;
        const pathField = document.getElementById('input-video-path').value.trim();
        const thumbInputEl = document.getElementById('input-thumbnail-file');

        if (!thumbInputEl || !thumbInputEl.files || thumbInputEl.files.length === 0) {
            alert("Please pick a graphic image file for your movie cover thumbnail.");
            return;
        }

        const targetImageBlob = thumbInputEl.files[0];

        const movieDataEntryObject = {
            id: "media-entry-id-" + Date.now(),
            title: titleField,
            category: categoryField,
            videoUrlPathString: pathField,
            savedThumbnailBlobData: targetImageBlob, // Stores cleanly into IndexedDB blocks securely
            description: document.getElementById('input-description').value.trim()
        };

        const saveTransaction = localDatabaseConnection.transaction([STORAGE_STORE_NAME], "readwrite");
        const saveStore = saveTransaction.objectStore(STORAGE_STORE_NAME);

        saveStore.add(movieDataEntryObject).onsuccess = () => {
            refreshCatalogDisplay();
            mediaUploadForm.reset();
            if (uploadModalOverlay) uploadModalOverlay.classList.remove('active');
            alert(`"${movieDataEntryObject.title}" saved successfully to your permanent vault room catalog!`);
        };
    });
}

// 7. Connect Sidebar Navigation Channels Filter Options Tabs Click Listeners Hooks
document.querySelectorAll('.nav-item').forEach(buttonNode => {
    buttonNode.addEventListener('click', (e) => {
        if (buttonNode.id === "admin-toggle-btn") return;
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        buttonNode.classList.add('active');
        activeInterfaceFilter = buttonNode.getAttribute('data-filter') || "all";
        renderEcosystemCards();
    });
});

if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
        const searchTermString = e.target.value.toLowerCase().trim();
        if (searchTermString === "") {
            renderEcosystemCards();
            return;
        }
        const filteredMatchesPool = totalCachedCatalogItems.filter(item => {
            const matchesSearch = item.title && item.title.toLowerCase().includes(searchTermString);
            const matchesCategory = activeInterfaceFilter === "all" || item.category === activeInterfaceFilter;
            return matchesSearch && matchesCategory;
        });

        if (catalogGridDisplay) {
            catalogGridDisplay.innerHTML = '';
            filteredMatchesPool.forEach(item => {
                const searchItemCard = document.createElement('div');
                searchItemCard.className = 'movie-card';
                const dynamicThumbStreamPath = URL.createObjectURL(item.savedThumbnailBlobData);
                searchItemCard.innerHTML = `<img class="movie-thumbnail" src="${dynamicThumbStreamPath}"><div class="movie-info"><div class="movie-card-title">${item.title}</div></div>`;
searchItemCard.addEventListener('click', () => bootVideoPlayback(item));catalogGridDisplay.appendChild(searchItemCard);});}});}