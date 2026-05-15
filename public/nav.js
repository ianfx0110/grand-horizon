document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.id = 'theme-toggle';
    themeToggle.innerHTML = '🌙 Mode';
    
    // Insert into nav-container if it exists
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(themeToggle);
    }

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '☀️ Mode';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        themeToggle.innerHTML = theme === 'light' ? '☀️ Mode' : '🌙 Mode';
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const navContent = document.getElementById('nav-content');

    if (menuBtn && navContent) {
        menuBtn.addEventListener('click', () => {
            navContent.classList.toggle('open');
        });
    }

    // Dynamic Navigation based on Session
    async function updateNav() {
        const res = await fetch('/api/me');
        const navLinks = document.getElementById('nav-content');
        if (!navLinks) return;

        if (res.ok) {
            const data = await res.json();
            const role = data.role;
            let html = `
                <a href="/">Home</a>
                <a href="/public/staff/dashboard.html">Dashboard</a>
                <a href="/public/staff/bookings.html">Reservations</a>
            `;
            
            if (role === 'admin') {
                html += `<a href="/public/admin/rooms.html">Rooms (Admin)</a>`;
                html += `<a href="/public/admin/register.html">Add Staff</a>`;
            }
            
            html += `<a href="#" id="logout-link" style="color: #ff4d4d;">Logout (${data.user.username})</a>`;
            navLinks.innerHTML = html;

            document.getElementById('logout-link').onclick = async (e) => {
                e.preventDefault();
                await fetch('/api/logout', { method: 'POST' });
                window.location.href = '/';
            };
        } else {
            navLinks.innerHTML = `
                <a href="/">Home</a>
                <a href="/public/about.html">About</a>
                <a href="/public/faqs.html">FAQs</a>
                <a href="/public/booker/index.html">Rooms</a>
                <a href="/public/login.html" class="btn-primary" style="padding: 0.5rem 1rem; color: var(--navy);">Staff Login</a>
            `;
        }

        // Active link highlighting
        const path = window.location.pathname;
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === path || (path === '/' && href === '/index.html')) {
                link.classList.add('active');
            }
        });
    }

    updateNav();

    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (menuBtn && !menuBtn.contains(e.target) && navContent && !navContent.contains(e.target)) {
            navContent.classList.remove('open');
        }
    });
});
