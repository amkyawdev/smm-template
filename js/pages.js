/**
 * SMM Service - Pages JavaScript
 * About, Contact, Get Started
 */

class PageManager {
    constructor() {
        this.apiBase = '/api';
        this.telegramLink = '#';
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupFAQ();
        this.setupStatsCounter();
        this.setupSmoothScroll();
        this.initThreeFlames();
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            const data = await response.json();
            
            if (data.site_title) {
                document.title = data.site_title + ' - ' + this.getPageTitle();
            }
            if (data.telegram_link) {
                this.telegramLink = data.telegram_link;
                this.updateTelegramLinks();
            }
        } catch (error) {
            console.log('Using default settings');
        }
    }

    getPageTitle() {
        const path = window.location.pathname;
        if (path.includes('about')) return 'About Us';
        if (path.includes('contact')) return 'Contact';
        if (path.includes('index')) return 'Get Started';
        return 'SMM Service';
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
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Buy buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBuy(e));
        });

        // Touch feedback
        document.querySelectorAll('.btn, .pricing-card, .step-card').forEach(el => {
            el.addEventListener('touchstart', () => {
                el.style.transform = 'scale(0.98)';
            }, { passive: true });
            el.addEventListener('touchend', () => {
                el.style.transform = '';
            }, { passive: true });
        });
    }

    handleContactForm(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.elements['name'].value,
            email: form.elements['email'].value,
            subject: form.elements['subject']?.value || '',
            message: form.elements['message'].value
        };

        // Validate
        if (!data.name || !data.email || !data.message) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show success
        this.showNotification('Message sent successfully! We will get back to you soon.', 'success');
        form.reset();

        // Open Telegram as alternative
        setTimeout(() => {
            window.open(this.telegramLink, '_blank');
        }, 1000);
    }

    handleBuy(e) {
        const btn = e.currentTarget;
        const service = btn.dataset.service;
        const price = btn.dataset.price;

        this.createRipple(e, btn);

        setTimeout(() => {
            // Construct message for Telegram
            const message = encodeURIComponent(`Hi! I want to order: ${service}\nPrice: $${price}`);
            window.open(`${this.telegramLink}?text=${message}`, '_blank');
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

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all
                    faqItems.forEach(i => i.classList.remove('active'));
                    
                    // Toggle current
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
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

        document.querySelectorAll('.stats-number').forEach(stat => {
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

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
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

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i>
            </div>
            <span class="notification-message">${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--dark, #0f172a);
            border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.pageManager = new PageManager();
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
