// para tener nav bars diferentes
 
        let usuarioActual = null;
        let vistaActual = 'landing';
        let idResenaEditando = null;
        let filtroGeneroActual = 'all';
        let datosImagenCargada = null;
        let opcionSubidaActual = 'upload';

        // Initialize App
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            setupEventListeners();
            checkAuthState();
        });

        function initializeApp() {
            // Initialize localStorage if empty
            if (!localStorage.getItem('users')) {
                localStorage.setItem('users', JSON.stringify([]));
            }
            if (!localStorage.getItem('reviews')) {
                localStorage.setItem('reviews', JSON.stringify([]));
            }
            if (!localStorage.getItem('bookmarks')) {
                localStorage.setItem('bookmarks', JSON.stringify([]));
            }
        }

        function setupEventListeners() {
            // Logo click to return to landing page
            document.getElementById('logo-home').addEventListener('click', () => {
                showView('landing');
            });

            // Back to landing links
            document.getElementById('back-to-landing').addEventListener('click', (e) => {
                e.preventDefault();
                showView('landing');
            });

            document.getElementById('back-to-landing-signup').addEventListener('click', (e) => {
                e.preventDefault();
                showView('landing');
            });

            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = e.target.dataset.view;
                    if (usuarioActual) {
                        showView(view);
                    }
                });
            });

            // Auth buttons
            document.getElementById('login-btn').addEventListener('click', () => showView('login'));
            document.getElementById('logout-btn').addEventListener('click', logout);
            document.getElementById('show-signup').addEventListener('click', (e) => {
                e.preventDefault();
                showView('signup');
            });
            document.getElementById('show-login').addEventListener('click', (e) => {
                e.preventDefault();
                showView('login');
            });

            // Forms
            document.getElementById('login-form').addEventListener('submit', handleLogin);
            document.getElementById('signup-form').addEventListener('submit', handleSignup);
            document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);

            // Modal
            document.getElementById('add-review-btn').addEventListener('click', () => openReviewModal());
            document.getElementById('close-modal').addEventListener('click', closeReviewModal);
            document.getElementById('cancel-review').addEventListener('click', closeReviewModal);

            // Rating stars
            document.querySelectorAll('#rating-stars .star').forEach(star => {
                star.addEventListener('click', (e) => {
                    const rating = parseInt(e.target.dataset.rating);
                    setRating(rating);
                });
                
                // Add hover effect
                star.addEventListener('mouseover', (e) => {
                    const rating = parseInt(e.target.dataset.rating);
                    hoverRating(rating);
                });
                
                star.addEventListener('mouseout', () => {
                    resetRatingHover();
                });
            });

            // Genre filters
            document.querySelectorAll('.btn-filtro').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const genre = e.target.dataset.genre;
                    setGenreFilter(genre);
                });
            });

            // Genre cards
            document.querySelectorAll('.genre-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const genre = e.target.closest('.genre-card').dataset.genre;
                    setGenreFilter(genre);
                    showView('home');
                });
            });

            // Profile actions
            document.getElementById('delete-account').addEventListener('click', deleteAccount);

            // Photo upload functionality
            setupPhotoUpload();

            // Mobile menu toggle
            document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

            // Mobile navigation
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = e.target.dataset.view;
                    if (usuarioActual) {
                        showView(view);
                        closeMobileMenu();
                    }
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                const mobileNav = document.getElementById('mobile-nav');
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                
                if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMobileMenu();
                }
            });
        }

        function setupPhotoUpload() {
            const uploadOptions = document.querySelectorAll('.upload-option');
            const uploadArea = document.getElementById('upload-area');
            const urlArea = document.getElementById('url-area');
            const fileInput = document.getElementById('book-cover-file');
            const urlInput = document.getElementById('book-cover-url');

            // Upload option switching
            uploadOptions.forEach(option => {
                option.addEventListener('click', () => {
                    uploadOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    opcionSubidaActual = option.dataset.option;
                    
                    if (opcionSubidaActual === 'upload') {
                        uploadArea.style.display = 'block';
                        urlArea.style.display = 'none';
                        urlInput.value = '';
                    } else {
                        uploadArea.style.display = 'none';
                        urlArea.style.display = 'block';
                        removeImage();
                    }
                });
            });

            // File upload
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                }
            });

            // URL input
            urlInput.addEventListener('input', () => {
                if (urlInput.value) {
                    showImagePreview(urlInput.value);
                } else {
                    hideImagePreview();
                }
            });
        }

        function handleFileUpload(file) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccioná un archivo de imagen.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('El archivo no debe tener más de 5MB.');
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = (e) => {
                datosImagenCargada = e.target.result;
                showImagePreview(datosImagenCargada);
                document.getElementById('upload-area').classList.add('has-file');
            };
            reader.readAsDataURL(file);
        }

        function showImagePreview(src) {
            const preview = document.getElementById('image-preview');
            const container = document.getElementById('image-preview-container');
            
            preview.src = src;
            container.style.display = 'block';
        }

        function hideImagePreview() {
            const container = document.getElementById('image-preview-container');
            container.style.display = 'none';
        }

        function removeImage() {
            datosImagenCargada = null;
            document.getElementById('book-cover-file').value = '';
            document.getElementById('book-cover-url').value = '';
            document.getElementById('upload-area').classList.remove('has-file');
            hideImagePreview();
        }

        function checkAuthState() {
            const savedUser = localStorage.getItem('usuarioActual');
            if (savedUser) {
                usuarioActual = JSON.parse(savedUser);
                updateAuthUI();
                showView('home');
            } else {
                showView('landing');
                updateLandingStats();
            }
        }

        function showView(viewName) {
            // Hide all views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });

            // Show selected view
            document.getElementById(`${viewName}-view`).classList.add('active');

            // Update navigation
            updateNavigation(viewName);

            vistaActual = viewName;

            // Load view-specific content
            switch(viewName) {
                case 'home':
                    loadReviews();
                    break;
                case 'my-reviews':
                    loadMyReviews();
                    break;
                case 'saved-reviews':
                    loadSavedReviews();
                    break;
                case 'profile':
                    loadProfile();
                    break;
            }
        }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                usuarioActual = user;
                localStorage.setItem('usuarioActual', JSON.stringify(user));
                updateAuthUI();
                showView('home');
            } else {
                alert('Contraseña incorrecta');
            }
        }

        function handleSignup(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            const users = JSON.parse(localStorage.getItem('users'));
            
            if (users.find(u => u.email === email)) {
                alert('Ese mail ya existe');
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            usuarioActual = newUser;
            localStorage.setItem('usuarioActual', JSON.stringify(newUser));
            updateAuthUI();
            showView('home');
        }

        function logout() {
            usuarioActual = null;
            localStorage.removeItem('usuarioActual');
            updateAuthUI();
            showView('login');
        }

        function updateAuthUI() {
            const loginBtn = document.getElementById('login-btn');
            const logoutBtn = document.getElementById('logout-btn');
            const userName = document.getElementById('user-name');
            const addReviewBtn = document.getElementById('add-review-btn');

            if (usuarioActual) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
                userName.style.display = 'block';
                userName.textContent = usuarioActual.name;
                addReviewBtn.style.display = 'flex';
            } else {
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
                userName.style.display = 'none';
                addReviewBtn.style.display = 'none';
            }
        }

        function openReviewModal(reviewId = null) {
            idResenaEditando = reviewId;
            const modal = document.getElementById('review-modal');
            const title = document.getElementById('modal-title');
            
            // Reset upload state
            opcionSubidaActual = 'upload';
            datosImagenCargada = null;
            removeImage();
            
            // Reset upload options
            document.querySelectorAll('.upload-option').forEach(opt => opt.classList.remove('active'));
            document.querySelector('[data-option="upload"]').classList.add('active');
            document.getElementById('upload-area').style.display = 'block';
            document.getElementById('url-area').style.display = 'none';
            
            if (reviewId) {
                title.textContent = 'Editar Reseña';
                const reviews = JSON.parse(localStorage.getItem('reviews'));
                const review = reviews.find(r => r.id === reviewId);
                if (review) {
                    document.getElementById('book-title').value = review.title;
                    document.getElementById('book-genre').value = review.genre;
                    document.getElementById('review-text').value = review.text;
                    setRating(review.rating);
                    
                    // Handle existing image
                    if (review.coverUrl) {
                        if (review.coverUrl.startsWith('data:')) {
                            // It's an uploaded image
                            datosImagenCargada = review.coverUrl;
                            showImagePreview(review.coverUrl);
                            document.getElementById('upload-area').classList.add('has-file');
                        } else {
                            // It's a URL
                            opcionSubidaActual = 'url';
                            document.querySelectorAll('.upload-option').forEach(opt => opt.classList.remove('active'));
                            document.querySelector('[data-option="url"]').classList.add('active');
                            document.getElementById('upload-area').style.display = 'none';
                            document.getElementById('url-area').style.display = 'block';
                            document.getElementById('book-cover-url').value = review.coverUrl;
                            showImagePreview(review.coverUrl);
                        }
                    }
                }
            } else {
                title.textContent = 'Agregar Reseña';
                document.getElementById('review-form').reset();
                setRating(0);
            }
            
            modal.classList.add('active');
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.remove('active');
            idResenaEditando = null;
            removeImage();
        }

        function setRating(rating) {
            document.getElementById('book-rating').value = rating;
            const stars = document.querySelectorAll('#rating-stars .star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.remove('empty');
                } else {
                    star.classList.add('empty');
                }
            });
        }
        
        function hoverRating(rating) {
            const stars = document.querySelectorAll('#rating-stars .star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.style.transform = 'scale(1.2)';
                    star.style.color = '#f59e0b';
                } else {
                    star.style.transform = 'scale(1)';
                }
            });
        }
        
        function resetRatingHover() {
            const stars = document.querySelectorAll('#rating-stars .star');
            const currentRating = parseInt(document.getElementById('book-rating').value);
            
            stars.forEach((star, index) => {
                star.style.transform = 'scale(1)';
                if (index < currentRating) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '';
                }
            });
        }

        function handleReviewSubmit(e) {
            e.preventDefault();
            
            const title = document.getElementById('book-title').value;
            const genre = document.getElementById('book-genre').value;
            const rating = parseInt(document.getElementById('book-rating').value);
            const text = document.getElementById('review-text').value;
            
            // Get cover image
            let coverUrl = '';
            if (opcionSubidaActual === 'upload' && datosImagenCargada) {
                coverUrl = datosImagenCargada;
            } else if (opcionSubidaActual === 'url') {
                coverUrl = document.getElementById('book-cover-url').value;
            }

            if (rating === 0) {
                alert('Por favor seleccioná un rating.');
                return;
            }

            const reviews = JSON.parse(localStorage.getItem('reviews'));
            
            if (idResenaEditando) {
                const reviewIndex = reviews.findIndex(r => r.id === idResenaEditando);
                if (reviewIndex !== -1) {
                    reviews[reviewIndex] = {
                        ...reviews[reviewIndex],
                        title,
                        genre,
                        rating,
                        text,
                        coverUrl,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // Agregar res
                const newReview = {
                    id: Date.now().toString(),
                    title,
                    genre,
                    rating,
                    text,
                    coverUrl,
                    userId: usuarioActual.id,
                    userName: usuarioActual.name,
                    createdAt: new Date().toISOString()
                };
                reviews.unshift(newReview);
            }

            localStorage.setItem('reviews', JSON.stringify(reviews));
            closeReviewModal();
            
            if (vistaActual === 'home') {
                loadReviews();
            } else if (vistaActual === 'my-reviews') {
                loadMyReviews();
            }
        }

        function loadReviews() {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const container = document.getElementById('reviews-container');
            
            let filteredReviews = reviews;
            if (filtroGeneroActual !== 'all') {
                filteredReviews = reviews.filter(r => r.genre === filtroGeneroActual);
            }

            if (filteredReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Ninguna reseña encontrada.</h3>
                        <p>Sé el primero en escribir una!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredReviews.map(review => createReviewCard(review)).join('');
        }

        function loadMyReviews() {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const myReviews = reviews.filter(r => r.userId === usuarioActual.id);
            const container = document.getElementById('my-reviews-container');

            if (myReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No hay reseñas todavía.</h3>
                        <p>Arrancá por compartirnos la primera!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = myReviews.map(review => createReviewCard(review, true)).join('');
        }

        function loadSavedReviews() {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            const userBookmarks = bookmarks.filter(b => b.userId === usuarioActual.id);
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const savedReviews = reviews.filter(r => userBookmarks.some(b => b.reviewId === r.id));
            const container = document.getElementById('saved-reviews-container');

            if (savedReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No hay reseñas guardadas</h3>
                        <p>Mirá acá las reseñas que guardes!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = savedReviews.map(review => createReviewCard(review)).join('');
        }

        function loadProfile() {
            const container = document.getElementById('profile-info');
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const userReviews = reviews.filter(r => r.userId === usuarioActual.id);
            
            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primario), var(--secundario)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 2rem; font-weight: 700;">
                        ${usuarioActual.name.charAt(0)}
                    </div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${usuarioActual.name}</h3>
                    <p style="color: var(--text-muted);">${usuarioActual.email}</p>
                    <div style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-light); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-around; text-align: center;">
                            <div>
                                <div style="font-size: 2rem; font-weight: 700; color: var(--primario);">${userReviews.length}</div>
                                <div style="color: var(--text-light); font-size: 0.9rem;">Reseñas</div>
                            </div>
                            <div style="border-left: 1px solid var(--border-light); padding-left: 2rem;">
                                <div style="font-size: 2rem; font-weight: 700; color: var(--primario);">${calculateAverageRating(userReviews)}</div>
                                <div style="color: var(--text-light); font-size: 0.9rem;">Rating promedio</div>
                            </div>
                        </div>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">
                        Miembro desde ${new Date(usuarioActual.createdAt).toLocaleDateString("es-AR")}
                    </p>
                </div>
            `;
        }
        
        function calculateAverageRating(reviews) {
            if (reviews.length === 0) return '0.0';
            const sum = reviews.reduce((total, review) => total + review.rating, 0);
            return (sum / reviews.length).toFixed(1);
        }

        function createReviewCard(review, isOwner = false) {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            const isBookmarked = bookmarks.some(b => b.userId === usuarioActual.id && b.reviewId === review.id);
            const dateFormatted = formatDate(review.createdAt);
            
            return `
                <div class="review-card">
                    <div class="review-header">
                        <div class="book-info">
                            <h3>${review.title}</h3>
                            <div class="review-meta">
                                By ${review.userName} • ${review.genre} • ${dateFormatted}
                            </div>
                            <div class="star-rating">
                                ${Array.from({length: 5}, (_, i) => 
                                    `<span class="star ${i < review.rating ? '' : 'empty'}">★</span>`
                                ).join('')}
                            </div>
                        </div>
                        ${review.coverUrl ? `<img src="${review.coverUrl}" alt="${review.title}" class="book-cover" onerror="this.style.display='none'">` : ''}
                    </div>
                    <div class="review-text">${review.text}</div>
                    <div class="review-actions">
                        ${!isOwner ? `
                            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${review.id}')">
                                ${isBookmarked ? '★' : '☆'} ${isBookmarked ? 'Saved' : 'Save'}
                            </button>
                        ` : `
                            <button class="btn btn-secundario" onclick="openReviewModal('${review.id}')">Editar</button>
                            <button class="btn btn-danger" onclick="deleteReview('${review.id}')">Eliminar</button>
                        `}
                    </div>
                </div>
            `;
        }
        
        function formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return 'Hoy';
            } else if (diffDays === 1) {
                return 'Ayer';
            } else if (diffDays < 7) {
                return `Hace ${diffDays} días`;
            } else {
                return date.toLocaleDateString('en-AR', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        function toggleBookmark(reviewId) {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            const existingBookmark = bookmarks.findIndex(b => b.userId === usuarioActual.id && b.reviewId === reviewId);
            
            if (existingBookmark !== -1) {
                bookmarks.splice(existingBookmark, 1);
            } else {
                bookmarks.push({
                    userId: usuarioActual.id,
                    reviewId: reviewId,
                    createdAt: new Date().toISOString()
                });
            }
            
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            
            // Refresh current view
            if (vistaActual === 'home') {
                loadReviews();
            } else if (vistaActual === 'saved-reviews') {
                loadSavedReviews();
            }
        }

        function deleteReview(reviewId) {
            if (confirm('Estás seguro de que querés borrar esta reserva?')) {
                const reviews = JSON.parse(localStorage.getItem('reviews'));
                const updatedReviews = reviews.filter(r => r.id !== reviewId);
                localStorage.setItem('reviews', JSON.stringify(updatedReviews));
                
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
                const updatedBookmarks = bookmarks.filter(b => b.reviewId !== reviewId);
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                
                // refrescar
                if (vistaActual === 'my-reviews') {
                    loadMyReviews();
                } else if (vistaActual === 'home') {
                    loadReviews();
                }
            }
        }

        function setGenreFilter(genre) {
            filtroGeneroActual = genre;
            
            // Update filter buttons  {
            filtroGeneroActual = genre;
            
            // Update filter buttons
            document.querySelectorAll('.btn-filtro').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-genre="${genre}"]`).classList.add('active');
            
            // Reload reviews with filter
            if (vistaActual === 'home') {
                loadReviews();
            }
        }

        function deleteAccount() {
            if (confirm('Estás seguro de que querés borrar tu cuenta? Esta acción no es revertible.')) {
                const users = JSON.parse(localStorage.getItem('users'));
                const updatedUsers = users.filter(u => u.id !== usuarioActual.id);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                // Remove user's reviews
                const reviews = JSON.parse(localStorage.getItem('reviews'));
                const updatedReviews = reviews.filter(r => r.userId !== usuarioActual.id);
                localStorage.setItem('reviews', JSON.stringify(updatedReviews));
                
                // Remove user's bookmarks
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
                const updatedBookmarks = bookmarks.filter(b => b.userId !== usuarioActual.id);
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                
                logout();
            }
        }

        function toggleMobileMenu() {
            const mobileNav = document.getElementById('mobile-nav');
            mobileNav.classList.toggle('active');
        }

        function closeMobileMenu() {
            const mobileNav = document.getElementById('mobile-nav');
            mobileNav.classList.remove('active');
        }

        function updateNavigation(viewName) {
            //  escritorio
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');
            
            // mobile
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`.mobile-nav-link[data-view="${viewName}"]`)?.classList.add('active');
        }

        function updateLandingStats() {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const users = JSON.parse(localStorage.getItem('users'));
            
            document.getElementById('total-reviews').textContent = reviews.length;
            document.getElementById('total-users').textContent = users.length;
        }
