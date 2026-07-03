/**
 * SMM Service - Main Page JavaScript
 */

class SMMService {
    constructor() {
        this.apiBase = '/api';
        this.telegramLink = '#';
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadServices();
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupStatsCounter();
        this.initThreeFlames();
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            const data = await response.json();
            
            if (data.site_title) {
                document.title = data.site_title;
                const logo = document.querySelector('.logo');
                if (logo) logo.textContent = data.site_title;
            }
            if (data.telegram_link) {
                this.telegramLink = data.telegram_link;
                this.updateTelegramLinks();
            }
        } catch (error) {
            console.log('Using default settings');
        }
    }

    async loadServices() {
        try {
            const response = await fetch(`${this.apiBase}/services`);
            const services = await response.json();
            this.renderServices(services);
        } catch (error) {
            console.log('Loading default services');
            this.renderDefaultServices();
        }
    }

    renderServices(services) {
        const container = document.getElementById('services-grid');
        if (!container) return;

        container.innerHTML = services.map(service => this.createServiceCard(service)).join('');
        
        container.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBuy(e));
        });
    }

    renderDefaultServices() {
        const container = document.getElementById('services-grid');
        if (!container) return;

        const defaults = [
            { id: 1, name: 'Instagram Followers', icon: 'instagram', price: 9.99, description: 'High-quality Instagram followers', features: ['Real profiles', 'Fast delivery', '24/7 support'], badge: 'Popular' },
            { id: 2, name: 'TikTok Views', icon: 'play-circle', price: 4.99, description: 'Boost your TikTok video views', features: ['Instant start', 'High retention', 'Safe & secure'], badge: '' },
            { id: 3, name: 'YouTube Subscribers', icon: 'youtube', price: 19.99, description: 'Grow your YouTube channel', features: ['Real users', 'Gradual delivery', 'Money-back guarantee'], badge: 'Best' },
            { id: 4, name: 'Twitter Followers', icon: 'twitter', price: 7.99, description: 'Increase Twitter presence', features: ['Quality accounts', 'Drop protection', 'Instant delivery'], badge: '' },
            { id: 5, name: 'Facebook Likes', icon: 'facebook', price: 5.99, description: 'Get more Facebook engagement', features: ['Real likes', 'Fast delivery', 'Secure payment'], badge: '' },
            { id: 6, name: 'Telegram Members', icon: 'send', price: 8.99, description: 'Grow your Telegram group', features: ['Active members', 'No bots', '24/7 support'], badge: 'Hot' }
        ];

        container.innerHTML = defaults.map(service => this.createServiceCard(service)).join('');
        
        container.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBuy(e));
        });
    }

    createServiceCard(service) {
        const features = service.features ? service.features.split(',').map(f => f.trim()) : [];
        return `
            <div class="service-card" data-service-id="${service.id}">
                ${service.badge ? `<span class="service-badge">${service.badge}</span>` : ''}
                <div class="service-icon">
                    <i class="bi bi-${service.icon || 'star'}"></i>
                </div>
                <h3 class="service-title">${service.name}</h3>
                <div class="service-price">$${service.price}<span>/order</span></div>
                <p class="service-description">${service.description || ''}</p>
                <ul class="service-features">
                    ${features.map(f => `<li><i class="bi bi-check-circle-fill"></i> ${f}</li>`).join('')}
                </ul>
                <button class="btn btn-primary buy-btn" data-service="${service.name}" data-price="${service.price}">
                    Buy Now
                </button>
            </div>
        `;
    }

    handleBuy(e) {
        const btn = e.currentTarget;
        const service = btn.dataset.service;
        const price = btn.dataset.price;
        
        this.createRipple(e, btn);
        
        setTimeout(() => {
            window.open(this.telegramLink, '_blank');
        }, 300);
    }

    createRipple(e, element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    updateTelegramLinks() {
        document.querySelectorAll('.telegram-link, .floating-telegram, .btn-telegram').forEach(el => {
            el.href = this.telegramLink;
            el.onclick = (e) => {
                e.preventDefault();
                window.open(this.telegramLink, '_blank');
            };
        });
    }

    setupEventListeners() {
        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Touch feedback
        document.querySelectorAll('.btn, .service-card').forEach(el => {
            el.addEventListener('touchstart', () => {}, { passive: true });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.service-card, .stat-item, .why-us-item, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    setupStatsCounter() {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number').forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target || element.textContent.replace(/,/g, ''));
        const suffix = element.dataset.suffix || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString() + suffix;
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString() + suffix;
            }
        };

        update();
    }

    initThreeFlames() {
        if (typeof THREE !== 'undefined' && document.getElementById('bg-canvas')) {
            this.initThreeJS();
        }
    }

    initThreeJS() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Flame particles
        const flameGeometry = new THREE.BufferGeometry();
        const flameCount = 2000;
        const flamePositions = new Float32Array(flameCount * 3);
        const flameColors = new Float32Array(flameCount * 3);

        for (let i = 0; i < flameCount; i++) {
            flamePositions[i * 3] = (Math.random() - 0.5) * 50;
            flamePositions[i * 3 + 1] = Math.random() * 30 - 5;
            flamePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            
            flameColors[i * 3] = 0.4 + Math.random() * 0.3;
            flameColors[i * 3 + 1] = 0.2 + Math.random() * 0.2;
            flameColors[i * 3 + 2] = 0.1;
        }

        flameGeometry.setAttribute('position', new THREE.BufferAttribute(flamePositions, 3));
        flameGeometry.setAttribute('color', new THREE.BufferAttribute(flameColors, 3));

        const flameMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const flames = new THREE.Points(flameGeometry, flameMaterial);
        scene.add(flames);

        camera.position.z = 15;

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            const positions = flames.geometry.attributes.position.array;
            for (let i = 0; i < flameCount; i++) {
                positions[i * 3 + 1] += 0.05 + Math.random() * 0.02;
                positions[i * 3] += Math.sin(time + i * 0.01) * 0.01;
                
                if (positions[i * 3 + 1] > 25) {
                    positions[i * 3 + 1] = -5;
                    positions[i * 3] = (Math.random() - 0.5) * 50;
                }
            }
            flames.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.smmService = new SMMService();
});
