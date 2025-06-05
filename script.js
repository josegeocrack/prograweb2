
        // Application State
        let currentUser = null;
        let currentView = 'landing';
        let editingReviewId = null;
        let currentGenreFilter = 'all';
        let uploadedImageData = null;
        let currentUploadOption = 'upload';

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
                if (currentUser) {
                    showView('home');
                } else {
                    showView('landing');
                }
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
                    if (currentUser) {
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
            document.querySelectorAll('.filter-btn').forEach(btn => {
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
                    if (currentUser) {
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
                    
                    currentUploadOption = option.dataset.option;
                    
                    if (currentUploadOption === 'upload') {
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
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageData = e.target.result;
                showImagePreview(uploadedImageData);
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
            uploadedImageData = null;
            document.getElementById('book-cover-file').value = '';
            document.getElementById('book-cover-url').value = '';
            document.getElementById('upload-area').classList.remove('has-file');
            hideImagePreview();
        }

        function checkAuthState() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
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

            currentView = viewName;

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
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateAuthUI();
                showView('home');
            } else {
                alert('Invalid credentials');
            }
        }

        function handleSignup(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            const users = JSON.parse(localStorage.getItem('users'));
            
            if (users.find(u => u.email === email)) {
                alert('Email already exists');
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

            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            updateAuthUI();
            showView('home');
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateAuthUI();
            showView('login');
        }

        function updateAuthUI() {
            const loginBtn = document.getElementById('login-btn');
            const logoutBtn = document.getElementById('logout-btn');
            const userName = document.getElementById('user-name');
            const addReviewBtn = document.getElementById('add-review-btn');

            if (currentUser) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
                userName.style.display = 'block';
                userName.textContent = currentUser.name;
                addReviewBtn.style.display = 'flex';
            } else {
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
                userName.style.display = 'none';
                addReviewBtn.style.display = 'none';
            }
        }

        function openReviewModal(reviewId = null) {
            editingReviewId = reviewId;
            const modal = document.getElementById('review-modal');
            const title = document.getElementById('modal-title');
            
            // Reset upload state
            currentUploadOption = 'upload';
            uploadedImageData = null;
            removeImage();
            
            // Reset upload options
            document.querySelectorAll('.upload-option').forEach(opt => opt.classList.remove('active'));
            document.querySelector('[data-option="upload"]').classList.add('active');
            document.getElementById('upload-area').style.display = 'block';
            document.getElementById('url-area').style.display = 'none';
            
            if (reviewId) {
                title.textContent = 'Edit Review';
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
                            uploadedImageData = review.coverUrl;
                            showImagePreview(review.coverUrl);
                            document.getElementById('upload-area').classList.add('has-file');
                        } else {
                            // It's a URL
                            currentUploadOption = 'url';
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
                title.textContent = 'Add Review';
                document.getElementById('review-form').reset();
                setRating(0);
            }
            
            modal.classList.add('active');
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.remove('active');
            editingReviewId = null;
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
            if (currentUploadOption === 'upload' && uploadedImageData) {
                coverUrl = uploadedImageData;
            } else if (currentUploadOption === 'url') {
                coverUrl = document.getElementById('book-cover-url').value;
            }

            if (rating === 0) {
                alert('Please select a rating');
                return;
            }

            const reviews = JSON.parse(localStorage.getItem('reviews'));
            
            if (editingReviewId) {
                // Edit existing review
                const reviewIndex = reviews.findIndex(r => r.id === editingReviewId);
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
                // Add new review
                const newReview = {
                    id: Date.now().toString(),
                    title,
                    genre,
                    rating,
                    text,
                    coverUrl,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    createdAt: new Date().toISOString()
                };
                reviews.unshift(newReview);
            }

            localStorage.setItem('reviews', JSON.stringify(reviews));
            closeReviewModal();
            
            // Refresh current view
            if (currentView === 'home') {
                loadReviews();
            } else if (currentView === 'my-reviews') {
                loadMyReviews();
            }
        }

        function loadReviews() {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const container = document.getElementById('reviews-container');
            
            let filteredReviews = reviews;
            if (currentGenreFilter !== 'all') {
                filteredReviews = reviews.filter(r => r.genre === currentGenreFilter);
            }

            if (filteredReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No reviews found</h3>
                        <p>Be the first to share a book review!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredReviews.map(review => createReviewCard(review)).join('');
        }

        function loadMyReviews() {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const myReviews = reviews.filter(r => r.userId === currentUser.id);
            const container = document.getElementById('my-reviews-container');

            if (myReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No reviews yet</h3>
                        <p>Start by adding your first book review!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = myReviews.map(review => createReviewCard(review, true)).join('');
        }

        function loadSavedReviews() {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            const userBookmarks = bookmarks.filter(b => b.userId === currentUser.id);
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const savedReviews = reviews.filter(r => userBookmarks.some(b => b.reviewId === r.id));
            const container = document.getElementById('saved-reviews-container');

            if (savedReviews.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No saved reviews</h3>
                        <p>Bookmark reviews to save them here!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = savedReviews.map(review => createReviewCard(review)).join('');
        }

        function loadProfile() {
            const container = document.getElementById('profile-info');
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const userReviews = reviews.filter(r => r.userId === currentUser.id);
            
            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 2rem; font-weight: 700;">
                        ${currentUser.name.charAt(0)}
                    </div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${currentUser.name}</h3>
                    <p style="color: var(--text-muted);">${currentUser.email}</p>
                    <div style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-light); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-around; text-align: center;">
                            <div>
                                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${userReviews.length}</div>
                                <div style="color: var(--text-light); font-size: 0.9rem;">Reviews</div>
                            </div>
                            <div style="border-left: 1px solid var(--border-light); padding-left: 2rem;">
                                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${calculateAverageRating(userReviews)}</div>
                                <div style="color: var(--text-light); font-size: 0.9rem;">Avg Rating</div>
                            </div>
                        </div>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">
                        Member since ${new Date(currentUser.createdAt).toLocaleDateString()}
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
            const isBookmarked = bookmarks.some(b => b.userId === currentUser.id && b.reviewId === review.id);
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
                            <button class="btn btn-secondary" onclick="openReviewModal('${review.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteReview('${review.id}')">Delete</button>
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
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        function toggleBookmark(reviewId) {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            const existingBookmark = bookmarks.findIndex(b => b.userId === currentUser.id && b.reviewId === reviewId);
            
            if (existingBookmark !== -1) {
                bookmarks.splice(existingBookmark, 1);
            } else {
                bookmarks.push({
                    userId: currentUser.id,
                    reviewId: reviewId,
                    createdAt: new Date().toISOString()
                });
            }
            
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            
            // Refresh current view
            if (currentView === 'home') {
                loadReviews();
            } else if (currentView === 'saved-reviews') {
                loadSavedReviews();
            }
        }

        function deleteReview(reviewId) {
            if (confirm('Are you sure you want to delete this review?')) {
                const reviews = JSON.parse(localStorage.getItem('reviews'));
                const updatedReviews = reviews.filter(r => r.id !== reviewId);
                localStorage.setItem('reviews', JSON.stringify(updatedReviews));
                
                // Also remove any bookmarks for this review
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
                const updatedBookmarks = bookmarks.filter(b => b.reviewId !== reviewId);
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                
                // Refresh current view
                if (currentView === 'my-reviews') {
                    loadMyReviews();
                } else if (currentView === 'home') {
                    loadReviews();
                }
            }
        }

        function setGenreFilter(genre) {
            currentGenreFilter = genre;
            
            // Update filter buttons  {
            currentGenreFilter = genre;
            
            // Update filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-genre="${genre}"]`).classList.add('active');
            
            // Reload reviews with filter
            if (currentView === 'home') {
                loadReviews();
            }
        }

        function deleteAccount() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                const users = JSON.parse(localStorage.getItem('users'));
                const updatedUsers = users.filter(u => u.id !== currentUser.id);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                // Remove user's reviews
                const reviews = JSON.parse(localStorage.getItem('reviews'));
                const updatedReviews = reviews.filter(r => r.userId !== currentUser.id);
                localStorage.setItem('reviews', JSON.stringify(updatedReviews));
                
                // Remove user's bookmarks
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
                const updatedBookmarks = bookmarks.filter(b => b.userId !== currentUser.id);
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

        // Update the showView function to also update mobile navigation
        function updateNavigation(viewName) {
            // Update desktop navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');
            
            // Update mobile navigation
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
