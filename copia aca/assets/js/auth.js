// Auth.js - Maneja la autenticación y gestión de usuarios

class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
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

        // Cargar usuario si existe en localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI(true);
        }

        // Event listeners para formularios y botones
        document.addEventListener('click', (e) => {
            if (e.target.id === 'login-btn') {
                window.router.navigateTo('login');
            } else if (e.target.id === 'logout-btn') {
                this.handleLogout();
            } else if (e.target.id === 'show-signup') {
                e.preventDefault();
                window.router.navigateTo('signup');
            } else if (e.target.id === 'show-login') {
                e.preventDefault();
                window.router.navigateTo('login');
            } else if (e.target.id === 'back-to-landing' || e.target.id === 'back-to-landing-signup') {
                e.preventDefault();
                window.router.navigateTo('landing');
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin(e);
            } else if (e.target.id === 'signup-form') {
                e.preventDefault();
                this.handleSignup(e);
            }
        });

        // Custom validation for login email
        document.addEventListener('invalid', (e) => {
            if (e.target.id === 'login-email' && e.target.validity.typeMismatch) {
                e.target.setCustomValidity("Por favor, incluí un '@' en la dirección de correo. Falta el '@' en el mail.");
            }
        }, true);

        document.addEventListener('input', (e) => {
            if (e.target.id === 'login-email') {
                e.target.setCustomValidity("");
            }
        });
    }

    updateUI(isLoggedIn) {
        const userNameSpan = document.getElementById('user-name');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const restrictedLinks = document.querySelectorAll('.nav-link[data-restricted="true"]');
        const mobileNav = document.getElementById('mobile-nav');

        if (isLoggedIn && this.currentUser) {
            userNameSpan.textContent = this.currentUser.name;
            userNameSpan.style.display = 'inline';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline';
            restrictedLinks.forEach(link => link.style.display = 'block');
            
            // Update mobile nav
            if (mobileNav) {
                mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
                    link.style.display = 'block';
                });
            }
        } else {
            userNameSpan.style.display = 'none';
            loginBtn.style.display = 'inline';
            logoutBtn.style.display = 'none';
            restrictedLinks.forEach(link => link.style.display = 'none');
            
            // Update mobile nav
            if (mobileNav) {
                mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
                    if (link.dataset.restricted === 'true') {
                        link.style.display = 'none';
                    }
                });
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email);

            if (user && user.password === password) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUI(true);
                window.showToast('¡Bienvenido de vuelta!');
                // Asegurarse de que el router esté disponible antes de navegar
                if (window.router) {
                    window.router.navigateTo('home');
                }
            } else {
                window.showToast('Credenciales inválidas', 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            window.showToast('Error al iniciar sesión', 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            if (users.some(u => u.email === email)) {
                window.showToast('El email ya está registrado', 'error');
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.updateUI(true);
            window.showToast('¡Cuenta creada exitosamente!');
            // Asegurarse de que el router esté disponible antes de navegar
            if (window.router) {
                window.router.navigateTo('home');
            }
        } catch (error) {
            console.error('Error en signup:', error);
            window.showToast('Error al crear la cuenta', 'error');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI(false);
        window.showToast('Sesión cerrada');
        // Asegurarse de que el router esté disponible antes de navegar
        if (window.router) {
            window.router.navigateTo('landing');
        }
    }

    deleteAccount() {
        if (!this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

        // Remove user
        const updatedUsers = users.filter(u => u.id !== this.currentUser.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Remove user's reviews
        const updatedReviews = reviews.filter(r => r.userId !== this.currentUser.id);
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));

        // Remove user's bookmarks
        const updatedBookmarks = bookmarks.filter(b => b.userId !== this.currentUser.id);
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));

        // Logout
        this.handleLogout();
    }
}

// Initialize auth when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
}); 