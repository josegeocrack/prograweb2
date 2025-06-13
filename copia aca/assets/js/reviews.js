// Reviews.js - Maneja la funcionalidad de reseñas

let currentRating = 0;
let filtroGeneroActual = 'all';
let datosImagenCargada = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Modal events
    document.addEventListener('click', (e) => {
        if (e.target.id === 'add-review-btn') {
            openReviewModal();
        } else if (e.target.id === 'close-modal' || e.target.id === 'cancel-review') {
            closeReviewModal();
        }
    });

    // Rating stars
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('star')) {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        }
    });

    // Star hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('star')) {
            const rating = parseInt(e.target.dataset.rating);
            hoverRating(rating);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('star')) {
            resetRatingHover();
        }
    });

    // Genre filters
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-filtro')) {
            const genre = e.target.dataset.genre;
            setGenreFilter(genre);
        }
    });

    // Form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'review-form') {
            e.preventDefault();
            handleReviewSubmit(e);
        }
    });

    // Image upload
    document.addEventListener('change', (e) => {
        if (e.target.id === 'image-upload') {
            handleFileUpload(e.target.files[0]);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'remove-image') {
            removeImage();
        }
    });
});

// Review Functions
function openReviewModal(reviewId = null) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Reset form
    document.getElementById('review-form').reset();
    currentRating = 0;
    resetRatingHover();
    removeImage();
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setRating(rating) {
    currentRating = rating;
    updateStars(rating);
}

function hoverRating(rating) {
    updateStars(rating, true);
}

function resetRatingHover() {
    updateStars(currentRating);
}

function updateStars(rating, isHover = false) {
    const stars = document.querySelectorAll('#rating-stars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const bookTitle = document.getElementById('book-title').value;
    const bookGenre = document.getElementById('book-genre').value;
    const reviewText = document.getElementById('review-text').value;

    if (!currentRating) {
        window.showToast('Por favor, selecciona un rating', 'error');
        return;
    }

    const review = {
        id: Date.now().toString(),
        userId: window.auth.currentUser.id,
        userName: window.auth.currentUser.name,
        bookTitle,
        genre: bookGenre,
        rating: currentRating,
        text: reviewText,
        image: datosImagenCargada,
        date: new Date().toISOString()
    };

    // Save review
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // Close modal and refresh
    closeReviewModal();
    loadReviews();
    window.showToast('¡Reseña publicada con éxito!');
}

function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const container = document.getElementById('reviews-container');
    if (!container) return;

    let filteredReviews = reviews;
    if (filtroGeneroActual !== 'all') {
        filteredReviews = reviews.filter(review => review.genre === filtroGeneroActual);
    }

    container.innerHTML = '';
    filteredReviews.forEach(review => {
        const isOwner = window.auth.currentUser && review.userId === window.auth.currentUser.id;
        container.appendChild(createReviewCard(review, isOwner));
    });
}

function createReviewCard(review, isOwner = false) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <div class="review-header">
            <h3>${review.bookTitle}</h3>
            <span class="genre-tag">${review.genre}</span>
        </div>
        <div class="review-rating">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
        </div>
        <p class="review-text">${review.text}</p>
        ${review.image ? `<img src="${review.image}" alt="Imagen de la reseña" class="review-image">` : ''}
        <div class="review-footer">
            <span class="review-author">Por ${review.userName}</span>
            <span class="review-date">${formatDate(review.date)}</span>
        </div>
        ${isOwner ? `
            <div class="review-actions">
                <button onclick="deleteReview('${review.id}')" class="btn btn-danger">Eliminar</button>
            </div>
        ` : ''}
    `;
    return card;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function setGenreFilter(genre) {
    filtroGeneroActual = genre;
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === genre);
    });
    loadReviews();
}

// Image handling
function handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        datosImagenCargada = e.target.result;
        showImagePreview(datosImagenCargada);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(src) {
    const preview = document.getElementById('image-preview');
    preview.style.backgroundImage = `url(${src})`;
    document.getElementById('remove-image').style.display = 'block';
}

function removeImage() {
    datosImagenCargada = null;
    const preview = document.getElementById('image-preview');
    preview.style.backgroundImage = 'none';
    document.getElementById('remove-image').style.display = 'none';
    document.getElementById('image-upload').value = '';
}

// Delete review
function deleteReview(reviewId) {
    if (!window.auth.currentUser) return;

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
    loadReviews();
    window.showToast('Reseña eliminada');
}

// Export functions for use in other modules
window.loadReviews = loadReviews;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.deleteReview = deleteReview;

function loadMyReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const container = document.getElementById('my-reviews-container');
    if (!container) return;

    const myReviews = reviews.filter(review => review.userId === window.auth.currentUser.id);
    container.innerHTML = '';
    myReviews.forEach(review => {
        container.appendChild(createReviewCard(review, true));
    });
}

function loadSavedReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const container = document.getElementById('saved-reviews-container');
    if (!container) return;

    const userBookmarks = bookmarks.filter(b => b.userId === window.auth.currentUser.id);
    const savedReviews = reviews.filter(review => 
        userBookmarks.some(bookmark => bookmark.reviewId === review.id)
    );

    container.innerHTML = '';
    savedReviews.forEach(review => {
        container.appendChild(createReviewCard(review, false));
    });
}

function loadProfile() {
    const profileInfo = document.getElementById('profile-info');
    if (!profileInfo || !window.auth.currentUser) return;

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const userReviews = reviews.filter(r => r.userId === window.auth.currentUser.id);
    const averageRating = calculateAverageRating(userReviews);

    profileInfo.innerHTML = `
        <div class="profile-section">
            <h3>Información Personal</h3>
            <p><strong>Nombre:</strong> ${window.auth.currentUser.name}</p>
            <p><strong>Email:</strong> ${window.auth.currentUser.email}</p>
        </div>
        <div class="profile-section">
            <h3>Estadísticas</h3>
            <p><strong>Reseñas publicadas:</strong> ${userReviews.length}</p>
            <p><strong>Rating promedio otorgado:</strong> ${averageRating.toFixed(1)}</p>
        </div>
    `;

    // Add event listener for account deletion
    document.getElementById('delete-account')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que querés borrar tu cuenta? Esta acción no se puede deshacer.')) {
            window.auth.deleteAccount();
        }
    });
}

function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}

function updateLandingStats() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const totalReviews = document.getElementById('total-reviews');
    const totalUsers = document.getElementById('total-users');
    
    if (totalReviews) totalReviews.textContent = reviews.length;
    if (totalUsers) totalUsers.textContent = users.length;
}

// Add these to the window exports
window.loadMyReviews = loadMyReviews;
window.loadSavedReviews = loadSavedReviews;
window.loadProfile = loadProfile;
window.updateLandingStats = updateLandingStats; 