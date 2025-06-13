// Router.js - Maneja la navegación y carga de vistas

class Router {
    constructor() {
        this.currentView = null;
        this.views = {
            'landing': './views/landing.html',
            'genres': './views/generos.html',
            'my-reviews': './views/mis-resenas.html',
            'login': './views/login.html',
            'signup': './views/signup.html',
            'home': './views/home.html',
            'saved-reviews': './views/saved-reviews.html',
            'profile': './views/profile.html'
        };
        this.restrictedViews = ['home', 'my-reviews', 'saved-reviews', 'profile'];
        this.init();
    }

    async init() {
        // Cargar el header
        const headerResponse = await fetch('./components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHtml;

        // Configurar event listeners para navegación
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-view]');
            if (link) {
                e.preventDefault();
                const view = link.dataset.view;
                this.handleNavigation(view);
            }
        });

        // Cargar vista inicial
        const initialView = this.getInitialView();
        await this.navigateTo(initialView);
    }

    handleNavigation(view) {
        const isLoggedIn = !!window.auth.currentUser;
        
        // Si es una vista restringida y no está logueado
        if (this.restrictedViews.includes(view) && !isLoggedIn) {
            window.showToast('Debes iniciar sesión primero', 'error');
            this.navigateTo('login');
            return;
        }

        // Si está logueado y trata de acceder a login/signup
        if (isLoggedIn && (view === 'login' || view === 'signup')) {
            this.navigateTo('home');
            return;
        }

        this.navigateTo(view);
    }

    getInitialView() {
        // Si el usuario está logueado, ir a home, sino a landing
        return localStorage.getItem('currentUser') ? 'home' : 'landing';
    }

    async navigateTo(viewName) {
        try {
            // Ocultar vista actual
            if (this.currentView) {
                const currentViewElement = document.querySelector(`#${this.currentView}-view`);
                if (currentViewElement) {
                    currentViewElement.classList.remove('active');
                }
            }

            // Cargar nueva vista si existe en el router
            if (this.views[viewName]) {
                const response = await fetch(this.views[viewName]);
                const viewHtml = await response.text();
                document.getElementById('app').innerHTML = viewHtml;

                // Activar nueva vista
                const newViewElement = document.querySelector(`#${viewName}-view`);
                if (newViewElement) {
                    newViewElement.classList.add('active');
                }
                this.currentView = viewName;

                // Actualizar navegación
                this.updateNavigation(viewName);

                // Ejecutar lógica específica de la vista
                this.handleViewSpecificLogic(viewName);
            }
        } catch (error) {
            console.error('Error al navegar:', error);
            window.showToast('Error al cargar la vista', 'error');
        }
    }

    handleViewSpecificLogic(viewName) {
        switch (viewName) {
            case 'home':
                if (typeof window.loadReviews === 'function') {
                    window.loadReviews();
                }
                break;
            case 'my-reviews':
                if (typeof window.loadMyReviews === 'function') {
                    window.loadMyReviews();
                }
                break;
            case 'saved-reviews':
                if (typeof window.loadSavedReviews === 'function') {
                    window.loadSavedReviews();
                }
                break;
            case 'profile':
                if (typeof window.loadProfile === 'function') {
                    window.loadProfile();
                }
                break;
            case 'landing':
                if (typeof window.updateLandingStats === 'function') {
                    window.updateLandingStats();
                }
                break;
        }
    }

    updateNavigation(viewName) {
        const isLoggedIn = !!window.auth.currentUser;
        
        // Actualizar links activos
        document.querySelectorAll('.nav-link').forEach(link => {
            const isRestricted = this.restrictedViews.includes(link.dataset.view);
            link.style.display = isRestricted && !isLoggedIn ? 'none' : 'block';
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Actualizar links móviles
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            const isRestricted = this.restrictedViews.includes(link.dataset.view);
            link.style.display = isRestricted && !isLoggedIn ? 'none' : 'block';
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Cerrar menú móvil si está abierto
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
        }
    }
}

// Inicializar router cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
}); 