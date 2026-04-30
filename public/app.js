/**
 * Shared API and Auth utility for Grand Horizon Hotel Management
 */

const auth = {
    saveUser(user) {
        localStorage.setItem('ghh_user', JSON.stringify(user));
    },
    getUser() {
        const user = localStorage.getItem('ghh_user');
        return user ? JSON.parse(user) : null;
    },
    logout() {
        localStorage.removeItem('ghh_user');
        // Trigger fade out
        document.body.classList.add('fade-exit');
        setTimeout(() => {
            window.location.href = '/';
        }, 400);
    },
    async login(username, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            this.saveUser(data.user);
            // Auto redirect
            const target = data.user.role === 'admin' ? '/admin' : '/dashboard';
            document.body.classList.add('fade-exit');
            setTimeout(() => {
                window.location.href = target;
            }, 400);
        } else {
            throw new Error(data.error);
        }
        return data;
    },
    async signup(username, password) {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            // Auto login then redirect
            return this.login(username, password);
        } else {
            throw new Error(data.error);
        }
    },
    checkAuth() {
        const user = this.getUser();
        const path = window.location.pathname;
        const isAuthPage = ['/', '/login', '/signup'].includes(path);

        if (!user && !isAuthPage) {
            window.location.href = '/login';
            return;
        } 
        
        if (user && isAuthPage && path !== '/') {
            const target = user.role === 'admin' ? '/admin' : '/dashboard';
            window.location.href = target;
        }
    },
    
    initUI() {
        const user = this.getUser();
        
        // Handle Global Admin Link
        const adminLinks = document.querySelectorAll('#admin-link-global, [href="/admin"]');
        if (user && user.role !== 'admin') {
            adminLinks.forEach(el => el.style.display = 'none');
        }

        // Handle Logout Buttons
        document.querySelectorAll('#logout-btn, .logout-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
        });

        // Handle User Displays
        const userDisplay = document.getElementById('user-name-display');
        if (userDisplay && user) {
            userDisplay.textContent = user.username;
        }
    },

    initPageTransition() {
        // Create overlay if not exists
        if (!document.getElementById('page-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'page-overlay';
            overlay.innerHTML = '<div class="loader-bar"></div>';
            document.body.appendChild(overlay);
            
            // Hide after small delay
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 500);
        }

        // Intercept all internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin) && !link.target && !link.hasAttribute('download')) {
                const path = link.getAttribute('href');
                if (path && !path.startsWith('#')) {
                    e.preventDefault();
                    document.getElementById('page-overlay').classList.remove('hidden');
                    document.body.classList.add('fade-exit');
                    setTimeout(() => {
                        window.location.href = path;
                    }, 400);
                }
            }
        });
    }
};

// Auto check auth on all management pages
auth.checkAuth();

// Responsive Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    auth.initPageTransition();
    auth.initUI();
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== hamburger) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});

const api = {
    async getRooms() {
        const res = await fetch('/api/rooms');
        return await res.json();
    },

    async addRoom(room) {
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(room)
        });
        return await res.json();
    },
    
    async deleteRoom(id) {
        const res = await fetch(`/api/rooms/${id}`, {
            method: 'DELETE'
        });
        return await res.json();
    },

    async getRoomReservations(roomId) {
        const res = await fetch(`/api/rooms/${roomId}/reservations`);
        return await res.json();
    },

    async getReservations() {
        const res = await fetch('/api/reservations');
        return await res.json();
    },

    async getGuests() {
        const res = await fetch('/api/guests');
        return await res.json();
    },

    async addReservation(reservation) {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });
        return await res.json();
    },

    async deleteReservation(id) {
        const res = await fetch(`/api/reservations/${id}`, {
            method: 'DELETE'
        });
        return await res.json();
    },

    async updateReservationStatus(id, status) {
        const res = await fetch(`/api/reservations/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await res.json();
    },

    async submitFeedback(data) {
        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async getUsers() {
        const res = await fetch('/api/users');
        return await res.json();
    },

    async updateUserRole(userId, role) {
        const res = await fetch('/api/users/role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role })
        });
        return await res.json();
    },

    async deleteUser(userId) {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        return await res.json();
    },

    async getOverview() {
        const [rooms, reservations] = await Promise.all([
            this.getRooms(),
            this.getReservations()
        ]);
        return { rooms, reservations };
    }
};

window.api = api;
