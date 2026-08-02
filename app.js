let movieDatabase = JSON.parse(localStorage.getItem('steventv_db')) || [];
const movieGrid = document.getElementById('movie-grid');
const uploadForm = document.getElementById('upload-form');
const requestForm = document.getElementById('request-form');

function updateView() {
    movieGrid.innerHTML = '';
    movieDatabase.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${movie.thumbnail}" class="movie-thumbnail">
            <div class="movie-info"><h4>${movie.title}</h4></div>
            <button class="delete-movie-btn" onclick="deleteMovie(${index})">X</button>
        `;
        card.onclick = () => document.getElementById('main-video').src = movie.videoUrl;
        movieGrid.appendChild(card);
    });
}

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    movieDatabase.push({
        title: document.getElementById('form-title').value,
        videoUrl: document.getElementById('form-video').value,
        thumbnail: document.getElementById('form-thumb').value
    });
    localStorage.setItem('steventv_db', JSON.stringify(movieDatabase));
    updateView();
    uploadForm.reset();
    document.getElementById('admin-modal').classList.remove('active');
});

function deleteMovie(index) {
    movieDatabase.splice(index, 1);
    localStorage.setItem('steventv_db', JSON.stringify(movieDatabase));
    updateView();
}

requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('req-title').value;
    window.location.href = `mailto:stevenmugume152@://gmail.com Request&body=Request: ${title}`;
});

// Admin Modal Toggle
document.getElementById('open-admin-btn').onclick = () => document.getElementById('admin-modal').classList.add('active');
document.getElementById('close-admin-btn').onclick = () => document.getElementById('admin-modal').classList.remove('active');

updateView();
