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
        window.location.href = '/';
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
        if (!data.success) {
            throw new Error(data.error);
        }
        return data;
    },
    checkAuth() {
        if (!this.getUser() && !['/', '/login', '/signup'].includes(window.location.pathname)) {
            window.location.href = '/login';
        }
    }
};

// Auto check auth on all management pages
auth.checkAuth();

// Responsive Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
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
