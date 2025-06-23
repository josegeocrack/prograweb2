// ========================================
// VARIABLES GLOBALES
// ========================================

let usuarioActual = null;
let vistaActual = 'landing';
let idResenaEditando = null;
let filtroGeneroActual = 'all';
let datosImagenCargada = null;
let opcionSubidaActual = 'upload'; // por si sunbuis una foto

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    initializeApp();
    setupEventListeners();
    checkAuthState();

    // configura la validacion de mail para login y registro en base a la fx
    setupEmailValidation('login-email');
    setupEmailValidation('signup-email');

    // configura la validacion del formulario en base a la fx
    setupFieldValidation('review-text', "Por favor, completá este campo.");
    setupFieldValidation('book-genre', "Por favor, seleccioná un género de la lista.");
    setupFieldValidation('book-title', "Por favor, completá este campo.");
});

function initializeApp() { // para crear los arrays en el local storage
    initializeLocalStorage(['users', 'reviews', 'bookmarks']);
}

/**
 * @param {string[]} items
 */
function initializeLocalStorage(items) { //creo los arrays para manejar desp reservas y usuarios y guardados (en el local storage para q cada vez que abras la pag lo tengas en algun lado)
    items.forEach(item => {
        if (!localStorage.getItem(item)) {
            localStorage.setItem(item, JSON.stringify([]));
        }
    });
}

// ========================================
// MANEJO DE EVENT LISTENERS
// ========================================

function setupEventListeners() { //preparo los botones y los events que se ejecutan cuando los clickeo
    //si estas iniciado sesion volver con logo (si no no hay vuelta al home)
    document.getElementById('logo-home').addEventListener('click', () => {
        showView('landing');
    });

    setupBackToLandingNavigation(); // para volver al home

    // para navegar en la nav bar
    setupNavigationLinks('.nav-link');
    setupNavigationLinks('.mobile-nav-link', true);

    // para login y out
    document.getElementById('login-btn').addEventListener('click', () => showView('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    setupAuthNavigationButtons();

    // para el de login y registro y reseñas
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);

    // para reseñas
    document.getElementById('add-review-btn').addEventListener('click', () => openReviewModal());
    document.getElementById('close-modal').addEventListener('click', closeReviewModal);
    document.getElementById('cancel-review').addEventListener('click', closeReviewModal);

    // estrellas de rating
    document.querySelectorAll('#rating-stars .star').forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        });
        // efecto a medida que te moves por las estrellas (que se apaguen y prendan)
        star.addEventListener('mouseover', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            hoverRating(rating);
        });
        // cuando sacas el mouse, se apagan las estrellas
        star.addEventListener('mouseout', () => {
            resetRatingHover();
        });
    });

    // filtros para los generos
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const genre = e.target.dataset.genre;
            setGenreFilter(genre);
        });
    });

    // las fotos de los generos que son filtros de las resenias
    document.querySelectorAll('.genre-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const genre = e.target.closest('.genre-card').dataset.genre;
            setGenreFilter(genre);
            showView('home');
        });
    });

    document.getElementById('delete-account').addEventListener('click', deleteAccount);

    setupPhotoUpload();

    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu); //celu
    document.addEventListener('click', (e) => {
        const mobileNav = document.getElementById('mobile-nav');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// ========================================
// MANEJO DE AUTENTICACIÓN
// ========================================

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

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const passwordGroup = document.getElementById('login-password').closest('.form-group');

    const existingMessage = passwordGroup.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        usuarioActual = user;
        localStorage.setItem('usuarioActual', JSON.stringify(user));
        updateAuthUI();
        showView('home');
        if (passwordGroup.querySelector('.validation-message')) {
            passwordGroup.querySelector('.validation-message').remove();
        }
    } else {
        const message = document.createElement('div');
        message.className = 'validation-message show';
        message.textContent = 'Contraseña incorrecta';
        passwordGroup.appendChild(message);
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const emailGroup = document.getElementById('signup-email').closest('.form-group');
    const existingMessage = emailGroup.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users.find(u => u.email === email)) {
        const message = document.createElement('div');
        message.className = 'validation-message show';
        message.textContent = 'Ese mail ya existe';
        emailGroup.appendChild(message);
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
    showView('landing');
}

function updateAuthUI() {             // actualizo la pagina segun si tenes un usuario logueado o no
    //console.log('updateAuthUI called. usuarioActual:', usuarioActual); --> prueba
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userName = document.getElementById('user-name');
    const addReviewBtn = document.getElementById('add-review-btn');

    // para pantalla norml veo asi el doc
    const navInicio = document.getElementById('nav-inicio');
    const navGeneros = document.getElementById('nav-generos');
    const navMisResenas = document.getElementById('nav-mis-resenas');
    const navResenasGuardadas = document.getElementById('nav-resenas-guardadas');
    const navPerfil = document.getElementById('nav-perfil');
    // para celu
    const mobileNavInicio = document.getElementById('mobile-nav-inicio');
    const mobileNavGeneros = document.getElementById('mobile-nav-generos');
    const mobileNavMisResenas = document.getElementById('mobile-nav-mis-resenas');
    const mobileNavResenasGuardadas = document.getElementById('mobile-nav-resenas-guardadas');
    const mobileNavPerfil = document.getElementById('mobile-nav-perfil');

    if (usuarioActual) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userName.style.display = 'block';
        userName.textContent = usuarioActual.name;
        if (addReviewBtn) addReviewBtn.style.display = 'flex';
        if (navInicio) navInicio.style.display = '';
        if (navGeneros) navGeneros.style.display = '';
        if (navMisResenas) navMisResenas.style.display = '';
        if (navResenasGuardadas) navResenasGuardadas.style.display = '';
        if (navPerfil) navPerfil.style.display = '';
        if (mobileNavInicio) mobileNavInicio.style.display = '';
        if (mobileNavGeneros) mobileNavGeneros.style.display = '';
        if (mobileNavMisResenas) mobileNavMisResenas.style.display = '';
        if (mobileNavResenasGuardadas) mobileNavResenasGuardadas.style.display = '';
        if (mobileNavPerfil) mobileNavPerfil.style.display = '';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userName.style.display = 'none';
        if (addReviewBtn) addReviewBtn.style.display = 'none';
        if (navInicio) navInicio.style.display = 'none';
        if (navGeneros) navGeneros.style.display = 'none';
        if (navMisResenas) navMisResenas.style.display = 'none';
        if (navResenasGuardadas) navResenasGuardadas.style.display = 'none';
        if (navPerfil) navPerfil.style.display = 'none';
        if (mobileNavInicio) mobileNavInicio.style.display = 'none';
        if (mobileNavGeneros) mobileNavGeneros.style.display = 'none';
        if (mobileNavMisResenas) mobileNavMisResenas.style.display = 'none';
        if (mobileNavResenasGuardadas) mobileNavResenasGuardadas.style.display = 'none';
        if (mobileNavPerfil) mobileNavPerfil.style.display = 'none';
    }

    // te muestro o no el boton de crear reseña o el de login (todo segun usuario logueado o no)
    const landingCreateBtn = document.querySelector('.hero-actions .btn-primario');
    const landingLoginBtn = document.querySelector('.hero-actions .btn-secundario');
    if (usuarioActual) {
        if (landingCreateBtn) landingCreateBtn.style.display = 'none';
        if (landingLoginBtn) landingLoginBtn.style.display = 'none';
    } else {
        if (landingCreateBtn) landingCreateBtn.style.display = '';
        if (landingLoginBtn) landingLoginBtn.style.display = '';
    }

    // para celu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (usuarioActual) {
        if (mobileMenuBtn) mobileMenuBtn.style.display = '';
        if (mobileNav) mobileNav.style.display = '';
    } else {
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        if (mobileNav) mobileNav.style.display = 'none';
    }
}

function deleteAccount() {
    showConfirmationModal(
        'Borrar cuenta',
        '¿Estás seguro de que querés borrar tu cuenta? Esta acción no es revertible.',
        () => {
            // saco de la lista
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.filter(u => u.id !== usuarioActual.id);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            // saco sus reviews
            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            const updatedReviews = reviews.filter(r => r.userId !== usuarioActual.id);
            localStorage.setItem('reviews', JSON.stringify(updatedReviews));
            // idem guardados
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            const updatedBookmarks = bookmarks.filter(b => b.userId !== usuarioActual.id);
            localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
            // saco al usuario y vuelvo al landing
            usuarioActual = null;
            localStorage.removeItem('usuarioActual');
            updateAuthUI();
            showView('login');
            updateLandingStats();
        }
    );
}

// ========================================
// MANEJO DE VISTAS Y NAVEGACIÓN
// ========================================

function showView(viewName) {
    // esconde todas las views porq les saca el active
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // muestra la view seleccionada
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active');
    }

    // cuando salis de login o signup
    if (vistaActual === 'login' && viewName !== 'login') {
        const loginForm = document.getElementById('login-form');
        const validationMessage = loginForm.querySelector('.validation-message');
        if (validationMessage) validationMessage.remove();
    }
     if (vistaActual === 'signup' && viewName !== 'signup') {
        const signupForm = document.getElementById('signup-form');
        const validationMessage = signupForm.querySelector('.validation-message');
        if (validationMessage) validationMessage.remove();
    }

    // cuando volves a login o signup, resetea el formulario (para q no quede info guardada cada vez q entras)
    if (viewName === 'login') {
        document.getElementById('login-form').reset();
    } else if (viewName === 'signup') {
        document.getElementById('signup-form').reset();
    }

    updateNavigation(viewName);

    switch(viewName) { //segun la vista cargo resenas
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
    applyCustomValidation();
}

/**
 * 
 */
function setupBackToLandingNavigation() { //para volver al landing post cualq lugar
    const backToLandingSelectors = ['back-to-landing', 'back-to-landing-signup'];
    
    backToLandingSelectors.forEach(selector => {
        const element = document.getElementById(selector);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                showView('landing');
            });
        }
    });
}

/** //agarra todo lo que es de mobile
 * @param {string} selector - css
 * @param {boolean} isMobile - para saber si estas en el celular
 */
function setupNavigationLinks(selector, isMobile = false) {
    document.querySelectorAll(selector).forEach(link => {
        link.addEventListener('click', (e) => { //si clickeas cualq evento de mobile
            e.preventDefault();
            const view = e.target.dataset.view;
            if (usuarioActual) { //chequea que haya un usuario logueado
                showView(view);
                if (isMobile) {
                    closeMobileMenu();
                }
            }
        });
    });
}

/**
 * muestro boton de login o signup y te lleva a dde te tienen que llevar (su view correspndiernte)
 */
function setupAuthNavigationButtons() {
    const authButtons = [
        { id: 'show-signup', view: 'signup' },
        { id: 'show-login', view: 'login' }
    ];

    authButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                showView(button.view);
            });
        }
    });
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
    vistaActual = viewName;
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        // The "genres" view should highlight the "Géneros" nav link
        const linkView = link.dataset.view === 'genres' ? 'genres' : link.dataset.view;
        if (linkView === viewName) {
            link.classList.add('active');
        }
    });
}

// ========================================
// MANEJO DE RESEÑAS (CRUD)
// ========================================

function openReviewModal(reviewId = null) {
    idResenaEditando = reviewId;
    const modal = document.getElementById('review-modal');
    const title = document.getElementById('modal-title');
    
    // reseteo el estado de subida de foto
    opcionSubidaActual = 'upload';
    datosImagenCargada = null;
    removeImage();
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
            
            if (review.coverUrl) {
                if (review.coverUrl.startsWith('data:')) {
                    // si es una imagen subida
                    datosImagenCargada = review.coverUrl;
                    showImagePreview(review.coverUrl);
                    document.getElementById('upload-area').classList.add('has-file');
                } else {
                    // si es una url
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
    applyCustomValidation();
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.remove('active');
    idResenaEditando = null;
    removeImage();
}

function handleReviewSubmit(e) { //subida de reseña, validaciones y demas para subirl
    e.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const genre = document.getElementById('book-genre').value;
    const rating = parseInt(document.getElementById('book-rating').value);
    const text = document.getElementById('review-text').value;
    const ratingGroup = document.getElementById('rating-stars').closest('.form-group');
    const existingMessage = ratingGroup.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    let coverUrl = '';
    if (opcionSubidaActual === 'upload' && datosImagenCargada) {
        coverUrl = datosImagenCargada;
    } else if (opcionSubidaActual === 'url') {
        coverUrl = document.getElementById('book-cover-url').value;
    }

    if (rating === 0) {
        const message = document.createElement('div');
        message.className = 'validation-message show';
        message.textContent = 'Por favor seleccioná un rating';
        ratingGroup.appendChild(message);
        return;
    }

    const reviews = JSON.parse(localStorage.getItem('reviews'));
    const isEditing = !!idResenaEditando;
    
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
    
    if (isEditing) {
        showView(vistaActual);
    } else {
        showView('home');
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

function createReviewCard(review, isOwner = false) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')); //guardados
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

function deleteReview(reviewId) {
    showConfirmationModal(
        'Borrar reseña',
        '¿Estás seguro de que querés borrar esta reseña?',
        () => {
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const newReviews = reviews.filter(r => r.id !== reviewId);
            localStorage.setItem('reviews', JSON.stringify(newReviews));
            loadMyReviews();
        }
    );
}

function toggleBookmark(reviewId) {
    const reviews = JSON.parse(localStorage.getItem('reviews'));
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        const review = reviews[reviewIndex];
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
        const isBookmarked = bookmarks.some(b => b.userId === usuarioActual.id && b.reviewId === review.id);
        if (isBookmarked) {
            const newBookmarks = bookmarks.filter(b => b.userId !== usuarioActual.id || b.reviewId !== review.id);
            localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
        } else {
            const newBookmark = {
                id: Date.now().toString(),
                userId: usuarioActual.id,
                reviewId: review.id
            };
            bookmarks.push(newBookmark);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }
        if (vistaActual === 'saved-reviews') {
            loadSavedReviews();
        } else {
            loadReviews();
        }
    }
}

// ========================================
// MANEJO DE ARCHIVOS E IMÁGENES
// ========================================

function setupPhotoUpload() {
    const uploadOptions = document.querySelectorAll('.upload-option');
    const uploadArea = document.getElementById('upload-area');
    const urlArea = document.getElementById('url-area');
    const fileInput = document.getElementById('book-cover-file');
    const urlInput = document.getElementById('book-cover-url');

    // segun si es url o si es archivo (para mostrar el boton mas prolijo)
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

    // subis archivo de foto pero de distintas formas
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
    // con url
    urlInput.addEventListener('input', () => {
        if (urlInput.value) {
            showImagePreview(urlInput.value);
        } else {
            hideImagePreview();
        }
    });
}

function handleFileUpload(file) { //para ver la foto que se sube como archivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor seleccioná un archivo de imagen.');
        return;
    }
    if (file.size > 5 * 1024 * 1024) { // limite 5mb
        alert('El archivo no debe tener más de 5MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        datosImagenCargada = e.target.result;
        showImagePreview(datosImagenCargada);
        document.getElementById('upload-area').classList.add('has-file');
    };
    reader.readAsDataURL(file);
}

//te muestra la foto que subio en un cuadrado chico abajo
function showImagePreview(src) {
    //const preview = document.getElementById('preview-img');
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

// ========================================
// MANEJO DE RATING Y FILTROS
// ========================================

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

function setGenreFilter(genre) {
    filtroGeneroActual = genre;
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-genre="${genre}"]`).classList.add('active');

    // recargas resenas con el filtro
    if (vistaActual === 'home') {
        loadReviews();
    }
}

// ========================================
// UTILIDADES Y HELPERS
// ========================================

/**
 * configura la validacion de mail
 * @param {string} emailFieldId - el id del campo de entrada de email
 */
function setupEmailValidation(emailFieldId) {
    const emailField = document.getElementById(emailFieldId);
    if (emailField) {
        emailField.addEventListener('invalid', function(e) { // el valor invalido lo tuneo
            if (emailField.validity.typeMismatch) {
                emailField.setCustomValidity("Por favor, incluí un '@' en la dirección de correo. Falta el '@' en el mail.");
            } else {
                emailField.setCustomValidity("");
            }
        }); 
        emailField.addEventListener('input', function(e) {
            emailField.setCustomValidity("");
        });
    }
}

/**
 * @param {string} fieldId - cuadrado del form
 * @param {string} errorMessage - mensaje q queres tirar
 */
function setupFieldValidation(fieldId, errorMessage) {          //para cualq cosa q mete el usuairo
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('invalid', function(e) {
            if (field.validity.valueMissing) {
                field.setCustomValidity(errorMessage);
            } else {
                field.setCustomValidity("");
            }
        });
        field.addEventListener('input', function(e) {
            field.setCustomValidity("");
        });
    }
}

function loadProfile() { //parte del perfil, edito desde aca con dato y lo agrego al html
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

function formatDate(dateStr) { //que las fechas esten ok 
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR");
}

function showConfirmationModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('confirmation-title');
    const modalMessage = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirmation-confirm');
    const cancelBtn = document.getElementById('confirmation-cancel');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('active');

    const handleConfirm = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        onConfirm();
    };

    const handleCancel = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
}

function updateLandingStats() { //la pag principal (funciona pero no hay usuarios jeje)
    const totalUsersElem = document.getElementById('total-users');
    const totalReviewsElem = document.getElementById('total-reviews');

    if (!totalUsersElem || !totalReviewsElem) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    totalUsersElem.textContent = users.length;
    totalReviewsElem.textContent = reviews.length;
}

function applyCustomValidation() {
    //mail
    const loginEmail = document.getElementById('login-email');
    if (loginEmail) {
        loginEmail.addEventListener('invalid', function(e) {
            if (loginEmail.validity.valueMissing) {
                loginEmail.setCustomValidity("Por favor, completá este campo.");
            } else if (loginEmail.validity.typeMismatch) {
                loginEmail.setCustomValidity("Por favor, incluí un '@' en la dirección de correo. Falta el '@' en el mail.");
            } else {
                loginEmail.setCustomValidity("");
            }
        });
        loginEmail.addEventListener('input', function(e) {
            loginEmail.setCustomValidity("");
        });
    }
    //contra
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
        loginPassword.addEventListener('invalid', function(e) {
            if (loginPassword.validity.valueMissing) {
                loginPassword.setCustomValidity("Por favor, completá este campo.");
            } else {
                loginPassword.setCustomValidity("");
            }
        });
        loginPassword.addEventListener('input', function(e) {
            loginPassword.setCustomValidity("");
        });
    }
    //  nombre
    const signupName = document.getElementById('signup-name');
    if (signupName) {
        signupName.addEventListener('invalid', function(e) {
            if (signupName.validity.valueMissing) {
                signupName.setCustomValidity("Por favor, completá este campo.");
            } else {
                signupName.setCustomValidity("");
            }
        });
        signupName.addEventListener('input', function(e) {
            signupName.setCustomValidity("");
        });
    }
    // mail registro
    const signupEmail = document.getElementById('signup-email');
    if (signupEmail) {
        signupEmail.addEventListener('invalid', function(e) {
            if (signupEmail.validity.valueMissing) {
                signupEmail.setCustomValidity("Por favor, completá este campo.");
            } else if (signupEmail.validity.typeMismatch) {
                signupEmail.setCustomValidity("Por favor, incluí un '@' en la dirección de correo. Falta el '@' en el mail.");
            } else {
                signupEmail.setCustomValidity("");
            }
        });
        signupEmail.addEventListener('input', function(e) {
            signupEmail.setCustomValidity("");
        });
    }
    // contra registro
    const signupPassword = document.getElementById('signup-password');
    if (signupPassword) {
        signupPassword.addEventListener('invalid', function(e) {
            if (signupPassword.validity.valueMissing) {
                signupPassword.setCustomValidity("Por favor, completá este campo.");
            } else {
                signupPassword.setCustomValidity("");
            }
        });
        signupPassword.addEventListener('input', function(e) {
            signupPassword.setCustomValidity("");
        });
    }
    // reseña
    const reviewText = document.getElementById('review-text');
    if (reviewText) {
        reviewText.addEventListener('invalid', function(e) {
            if (reviewText.validity.valueMissing) {
                reviewText.setCustomValidity("Por favor, completá este campo.");
            } else {
                reviewText.setCustomValidity("");
            }
        });
        reviewText.addEventListener('input', function(e) {
            reviewText.setCustomValidity("");
        });
    }
    // genero
    const reviewGenre = document.getElementById('book-genre');
    if (reviewGenre) {
        reviewGenre.addEventListener('invalid', function(e) {
            if (reviewGenre.validity.valueMissing) {
                reviewGenre.setCustomValidity("Por favor, seleccioná un género de la lista.");
            } else {
                reviewGenre.setCustomValidity("");
            }
        });
        reviewGenre.addEventListener('input', function(e) {
            reviewGenre.setCustomValidity("");
        });
    }
    // titulo
    const bookTitle = document.getElementById('book-title');
    if (bookTitle) {
        bookTitle.addEventListener('invalid', function(e) {
            if (bookTitle.validity.valueMissing) {
                bookTitle.setCustomValidity("Por favor, completá este campo.");
            } else {
                bookTitle.setCustomValidity("");
            }
        });
        bookTitle.addEventListener('input', function(e) {
            bookTitle.setCustomValidity("");
        });
    }
}
