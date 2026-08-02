// 1. Production Content Library Seeds (Default online samples)
const defaultSeeds = [
    {
        id: "seed-1",
        title: "Tears of Steel (Sci-Fi Ultra HD)",
        category: "Sci-Fi / Action",
        description: "Explore a stunning futuristic dystopian world where a task force of computational scientists must deploy hyper-advanced technological counter-measures to save earth from renegade mechanical engines.",
        thumbnail: "https://wikimedia.org",
        videoUrl: "https://googleapis.com",
        subtitles: "https://githubusercontent.com"
    },
    {
        id: "seed-2",
        title: "Big Buck Bunny (Premium Edition)",
        category: "Family Animation",
        description: "Witness the comedic and beautifully synchronized adventure of a giant, gentle forest rabbit who devises complex tactical traps to reclaim his territory from a chaotic trio of woodland bullies.",
        thumbnail: "https://wikimedia.org",
        videoUrl: "https://googleapis.com",
        subtitles: ""
    }
];

// Persistent Local Database State Check
let movieDatabase = JSON.parse(localStorage.getItem('steventv_pro_db')) || defaultSeeds;

// 2. DOM Selectors Mapping
const mainVideo = document.getElementById('main-video');
const videoTrack = document.getElementById('video-track');
const movieTitle = document.getElementById('movie-title');
const movieCategory = document.getElementById('movie-category');
const movieDescription = document.getElementById('movie-description');
const movieGrid = document.getElementById('movie-grid');
const searchBar = document.getElementById('search-bar');

// Custom Control Nodes
const btnPlay = document.getElementById('btn-play');
const btnBack = document.getElementById('btn-back');
const btnFwd = document.getElementById('btn-fwd');
const btnFullscreen = document.getElementById('btn-fullscreen');

// Admin & Security Management Nodes
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminAuthZone = document.getElementById('admin-auth-zone');
const adminPassInput = document.getElementById('admin-pass-input');
const btnAuthorize = document.getElementById('btn-authorize');
const authErrorMsg = document.getElementById('auth-error-msg');
const uploadForm = document.getElementById('upload-form');

// 3. Central Media Deployment Engine
function targetMediaLoad(movie) {
    mainVideo.src = movie.videoUrl;
    movieTitle.textContent = movie.title;
    movieCategory.textContent = movie.category;
    movieDescription.textContent = movie.description;

    if (movie.subtitles && movie.subtitles.trim() !== "") {
        videoTrack.src = movie.subtitles;
        videoTrack.mode = "showing";
    } else {
        videoTrack.src = "";
        videoTrack.mode = "disabled";
    }
    
    mainVideo.load();
    mainVideo.play().catch(() => console.log("Buffering video segment streams context..."));
}

function updateCatalogView(sourceArray) {
    movieGrid.innerHTML = '';
    if(sourceArray.length === 0) {
        movieGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #555; padding: 40px 0;">No active broadcasts found matching that search string.</p>`;
        return;
    }

    sourceArray.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-thumbnail" src="${movie.thumbnail}" alt="Thumbnail">
            <div class="movie-info">
                <div class="movie-card-title">${movie.title}</div>
                <div class="movie-card-cat">${movie.category}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            targetMediaLoad(movie);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        movieGrid.appendChild(card);
    });
}

// 4. Custom Interactivity Playback Core Mechanics
btnPlay.addEventListener('click', () => {
    if (mainVideo.paused) {
        mainVideo.play();
        btnPlay.textContent = "⏸️ Pause";
    } else {
        mainVideo.pause();
        btnPlay.textContent = "▶️ Play";
    }
});

btnBack.addEventListener('click', () => { mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 10); });
btnFwd.addEventListener('click', () => { mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 10); });

btnFullscreen.addEventListener('click', () => {
    if (mainVideo.requestFullscreen) { mainVideo.requestFullscreen(); }
    else if (mainVideo.webkitRequestFullscreen) { mainVideo.webkitRequestFullscreen(); } // iOS Safari support
});

// 5. Query Search Filter Pipeline
searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const matches = movieDatabase.filter(m => 
        m.title.toLowerCase().includes(term) || 
        m.category.toLowerCase().includes(term)
    );
    updateCatalogView(matches);
});

// 6. Access Control & Upload Authorization Management
const STEVENTV_SECRET = "admin123"; // 👈 Your dashboard password

openAdminBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
    uploadForm.classList.add('hidden');
    adminAuthZone.classList.remove('hidden');
    adminPassInput.value = "";
    authErrorMsg.textContent = "";
});

closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));

btnAuthorize.addEventListener('click', () => {
    if(adminPassInput.value === STEVENTV_SECRET) {
        adminAuthZone.classList.add('hidden');
        uploadForm.classList.remove('hidden');
    } else {
        authErrorMsg.textContent = "Invalid Admin Key. Secure clearance denied.";
    }
});

// New File Handler Upload Submission Logic
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get file handles directly from file input fields
    const videoFile = document.getElementById('form-video').files[0];
    const thumbFile = document.getElementById('form-thumb').files[0];
    const subsFile = document.getElementById('form-subtitles').files[0];

    // Generate local system stream paths
    const videoObjectURL = URL.createObjectURL(videoFile);
    const thumbObjectURL = URL.createObjectURL(thumbFile);
    
    let subsObjectURL = "";
    if (subsFile) {
        subsObjectURL = URL.createObjectURL(subsFile);
    }

    const entry = {
        id: "custom-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value.trim(),
        videoUrl: videoObjectURL,
        thumbnail: thumbObjectURL,
        subtitles: subsObjectURL,
        description: document.getElementById('form-desc').value.trim()
    };

    // Update memory database structure array
    movieDatabase.push(entry);
    
    // Save standard strings safely. Note: Object URLs cannot be cached persistently in localStorage.
    try {
        localStorage.setItem('steventv_pro_db', JSON.stringify(movieDatabase));
    } catch(err) {
        console.log("Saving online text streams array state...");
    }

    // Refresh UI layer instantly
    updateCatalogView(movieDatabase);
    targetMediaLoad(entry);
    
    uploadForm.reset();
    adminModal.classList.remove('active');
});

// 7. Initialization Manifest 
targetMediaLoad(movieDatabase[0]);
updateCatalogView(movieDatabase);
