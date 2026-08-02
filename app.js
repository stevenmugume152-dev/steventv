// 1. Initial Sample Media Library Data
const defaultSeeds = [
    {
        id: "seed-1",
        title: "Tears of Steel (Sci-Fi Ultra HD)",
        category: "Sci-Fi / Action",
        description: "Explore a stunning futuristic dystopian world where a task force of computational scientists must deploy hyper-advanced technological counter-measures to save earth from renegade mechanical engines.",
        thumbnail: "https://wikimedia.org",
        videoUrl: "https://googleapis.com",
        subtitles: "https://githubusercontent.com"
    }
];

// Load your movies library from persistent localStorage cache
let movieDatabase = JSON.parse(localStorage.getItem('steventv_pro_db')) || defaultSeeds;

// 2. DOM Selectors Mapping
const mainVideo = document.getElementById('main-video');
const videoTrack = document.getElementById('video-track');
const movieTitle = document.getElementById('movie-title');
const movieCategory = document.getElementById('movie-category');
const movieDescription = document.getElementById('movie-description');
const movieGrid = document.getElementById('movie-grid');
const searchBar = document.getElementById('search-bar');
const requestForm = document.getElementById('request-form');

// Admin Management Nodes
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

    sourceArray.forEach((movie) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-thumbnail" src="${movie.thumbnail}" alt="Thumbnail">
            <button class="delete-movie-btn" data-id="${movie.id}">❌</button>
            <div class="movie-info">
                <div class="movie-card-title">${movie.title}</div>
                <div class="movie-card-cat">${movie.category}</div>
            </div>
        `;
        
        // Load target clip on main layout click
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-movie-btn')) return;
            targetMediaLoad(movie);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Attach function for individual delete management
        const deleteBtn = card.querySelector('.delete-movie-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm(`Are you sure you want to remove "${movie.title}"?`)) {
                deleteMovieEntry(movie.id);
            }
        });

        movieGrid.appendChild(card);
    });
}

function deleteMovieEntry(id) {
    movieDatabase = movieDatabase.filter(movie => movie.id !== id);
    localStorage.setItem('steventv_pro_db', JSON.stringify(movieDatabase));
    updateCatalogView(movieDatabase);
}

// 4. Query Search Filter Pipeline
searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const matches = movieDatabase.filter(m => 
        m.title.toLowerCase().includes(term) || 
        m.category.toLowerCase().includes(term)
    );
    updateCatalogView(matches);
});

// 5. Access Control & Upload Authorization Management
const STEVENTV_SECRET = "admin123"; 

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

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const entry = {
        id: "custom-" + Date.now(),
        title: document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value.trim(),
        videoUrl: document.getElementById('form-video').value.trim(),
        thumbnail: document.getElementById('form-thumb').value.trim(),
        subtitles: document.getElementById('form-subtitles').value.trim(), 
        description: document.getElementById('form-desc').value.trim()
    };

    movieDatabase.push(entry);
    localStorage.setItem('steventv_pro_db', JSON.stringify(movieDatabase));

    updateCatalogView(movieDatabase);
    targetMediaLoad(entry);
    
    uploadForm.reset();
    adminModal.classList.remove('active');
});

// 6. User Request Form Execution Email Router
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const requestedTitle = document.getElementById('req-title').value.trim();
    const emailSubject = encodeURIComponent("StevenTV - New Movie Request Recommendation");
    const emailBody = encodeURIComponent(`Hi Steven,\n\nI would love to watch this film on StevenTV:\n\nMovie Title: ${requestedTitle}\n\nPlease upload it soon!`);
    
    window.location.href = `mailto:stevenmugume152@://gmail.com{emailSubject}&body=${emailBody}`;
    requestForm.reset();
});

// 7. Initialization Manifest 
if (movieDatabase.length > 0) {
    targetMediaLoad(movieDatabase);
}
updateCatalogView(movieDatabase);
