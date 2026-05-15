/**
 * Grand Horizon Hotel - Core Application Logic (DOM JS)
 * Handles dynamic content injection and micro-interactions
 */

const App = {
    init() {
        this.renderExperienceHub();
        this.renderRoomsPreview();
        this.observeAnimations();
    },

    renderExperienceHub() {
        const container = document.getElementById('experience-hub');
        if (!container) return;

        const experiences = [
            {
                title: "Culinary Excellence",
                desc: "Dine in our award-winning restaurants where international fusion meets local Kenyan heritage.",
                img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "The Azure Spa",
                desc: "Rejuvenate your soul with treatments inspired by ancient coastal wellness rituals.",
                img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "Infinity Vistas",
                desc: "Relax by our infinity pool overlooking the breathtaking Great Rift Valley horizon.",
                img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
        ];

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 6rem;" class="reveal">
                <h2 style="font-family: var(--font-serif); font-size: 3.5rem; color: var(--gold); margin-bottom: 1.5rem;">The Grand Experience</h2>
                <p style="color: var(--text-dim); max-width: 700px; margin: 0 auto; font-size: 1.2rem;">From the moment you step into our ivory lobby, you transition from the ordinary to the extraordinary.</p>
            </div>
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));">
                ${experiences.map((exp, i) => `
                    <div class="card reveal" style="transition-delay: ${i * 0.2}s">
                        <div style="height: 250px; background: url('${exp.img}') center/cover; border-radius: 4px; margin-bottom: 2rem;"></div>
                        <h3 style="color: var(--gold); font-size: 1.8rem; margin-bottom: 1rem;">${exp.title}</h3>
                        <p style="color: var(--text-dim);">${exp.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async renderRoomsPreview() {
        const container = document.getElementById('suites-container');
        if (!container) return;

        try {
            const res = await fetch('/api/rooms'); // Only getting available ones
            const rooms = await res.json();
            
            // Just take first 2 unique types for preview
            const uniqueTypes = [];
            const previewRooms = rooms.filter(r => {
                if (!uniqueTypes.includes(r.type_name) && uniqueTypes.length < 2) {
                    uniqueTypes.push(r.type_name);
                    return true;
                }
                return false;
            });

            if (previewRooms.length === 0) {
                container.innerHTML = `<p style="text-align: center; color: var(--text-dim);">No suites currently available for preview.</p>`;
                return;
            }

            container.innerHTML = previewRooms.map((room, i) => `
                <div style="display: flex; gap: 4rem; align-items: center; flex-wrap: wrap; margin-bottom: 4rem;" class="reveal">
                    <div style="flex: 1; min-width: 300px; height: 500px; background: url('${room.img_url || 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}') center/cover; border-radius: 12px; ${i % 2 !== 0 ? 'order: 2;' : ''}"></div>
                    <div style="flex: 1; min-width: 300px; padding: 2rem; ${i % 2 !== 0 ? 'order: 1;' : ''}">
                        <h3 style="font-family: var(--font-serif); font-size: 2.5rem; color: var(--gold); margin-bottom: 1.5rem;">${room.type_name}</h3>
                        <p style="font-size: 1.1rem; line-height: 2; margin-bottom: 2rem;">${room.description}</p>
                        <ul style="list-style: none; color: var(--text-dim); margin-bottom: 2rem;">
                            ${room.amenities.split(',').map(a => `<li style="margin-bottom: 0.5rem;">✓ ${a.trim()}</li>`).join('')}
                        </ul>
                        <div style="display: flex; align-items: center; gap: 2rem;">
                            <div>
                                <span style="font-size: 0.8rem; color: var(--gold); text-transform: uppercase;">Starting from</span>
                                <p style="font-size: 1.5rem; font-weight: 700;">KES ${Math.round(room.base_price).toLocaleString()}</p>
                            </div>
                            <a href="/booker/index.html" class="btn-primary">Reserve Now</a>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            console.error("Failed to load room previews", err);
        }
    },

    observeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
