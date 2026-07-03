/* ═══════════════════════════════════════════════════════════════
   SMM PRO - Advanced JavaScript System
   Smooth Animations & Micro-interactions
   ═══════════════════════════════════════════════════════════════ */

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

let currentFilter = 'all';

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ═══════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || (() => {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    })();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill',
        warning: 'bi-exclamation-circle-fill'
    };
    
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.animation = 'toastIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
    });
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 4000);
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS LOADER
   ═══════════════════════════════════════════════════════════════ */
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        if (settings) {
            const titleEl = document.getElementById('siteTitle');
            if (titleEl && settings.site_title) {
                animateTextChange(titleEl, settings.site_title);
            }
            
            const subtitleEl = document.getElementById('headerSubtitle');
            if (subtitleEl && settings.subtitle_text) {
                animateTextChange(subtitleEl, settings.subtitle_text);
            }
            
            const heroSubtitle = document.getElementById('heroSubtitle');
            if (heroSubtitle && settings.subtitle_text) {
                animateTextChange(heroSubtitle, settings.subtitle_text);
            }
            
            const telegramBtn = document.getElementById('telegramFloating');
            if (telegramBtn && settings.telegram_link) {
                telegramBtn.href = settings.telegram_link;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Smooth text change animation
function animateTextChange(element, newText) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        element.textContent = newText;
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 150);
}

/* ═══════════════════════════════════════════════════════════════
   PRICING LOADER WITH ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
async function loadPricing(type = 'all') {
    const grid = document.getElementById('pricingGrid');
    if (!grid) return;
    
    // Show skeleton loading
    grid.innerHTML = `
        <div class="pricing-card skeleton" style="height: 300px;"></div>
        <div class="pricing-card skeleton" style="height: 300px;"></div>
        <div class="pricing-card skeleton" style="height: 300px;"></div>
        <div class="pricing-card skeleton" style="height: 300px;"></div>
    `;
    
    try {
        const url = type && type !== 'all' ? `${API_URL}/pricing?type=${type}` : `${API_URL}/pricing`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div class="pricing-card" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">No packages available</p>
                </div>
            `;
            return;
        }
        
        const icons = {
            followers: 'bi-people-fill',
            views: 'bi-eye-fill',
            likes: 'bi-heart-fill',
            comments: 'bi-chat-left-text-fill'
        };
        
        const colors = {
            followers: '#FF6B35',
            views: '#00bfff',
            likes: '#FF3366',
            comments: '#00ff88'
        };
        
        let html = '';
        const grouped = data.reduce((acc, item) => {
            if (!acc[item.service_type]) acc[item.service_type] = [];
            acc[item.service_type].push(item);
            return acc;
        }, {});
        
        let delay = 0;
        for (const [serviceType, packages] of Object.entries(grouped)) {
            html += `
                <div style="grid-column: 1/-1;" class="pricing-group">
                    <h3 style="color: ${colors[serviceType] || '#FF6B35'}; margin-bottom: 20px; font-family: var(--font-display); font-size: 1.4rem; display: flex; align-items: center; gap: 12px;">
                        <i class="bi ${icons[serviceType] || 'bi-star-fill'}"></i> 
                        ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
            `;
            
            packages.forEach((pkg, index) => {
                const cardDelay = delay + (index * 100);
                html += `
                    <div class="pricing-card" style="animation-delay: ${cardDelay}ms;">
                        <i class="bi ${icons[pkg.service_type] || 'bi-star'} service-icon" style="color: ${colors[pkg.service_type] || '#FF6B35'};"></i>
                        <div class="package-name">${pkg.package_name}</div>
                        <div class="quantity">${pkg.quantity.toLocaleString()}</div>
                        <div class="price">${pkg.price_kyat.toLocaleString()} <span>Ks</span></div>
                        <button class="buy-btn" onclick="buyPackage('${pkg.service_type}', ${pkg.quantity}, ${pkg.price_kyat})">
                            <i class="bi bi-cart-plus"></i> Order Now
                        </button>
                    </div>
                `;
            });
            
            html += `</div></div>`;
            delay += 200;
        }
        
        grid.innerHTML = html;
        
        // Animate cards in
        grid.querySelectorAll('.pricing-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
    } catch (error) {
        console.error('Error loading pricing:', error);
        grid.innerHTML = `
            <div class="pricing-card" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="bi bi-wifi-off" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 16px;"></i>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">Failed to load packages. Please refresh.</p>
                <button onclick="loadPricing('${currentFilter}')" class="btn btn-outline" style="margin-top: 16px;">
                    <i class="bi bi-arrow-clockwise"></i> Retry
                </button>
            </div>
        `;
    }
}

/* ═══════════════════════════════════════════════════════════════
   PRICING FILTER
   ═══════════════════════════════════════════════════════════════ */
window.filterPricing = function(type) {
    currentFilter = type;
    
    document.querySelectorAll('.pricing-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    loadPricing(type);
};

/* ═══════════════════════════════════════════════════════════════
   BUY PACKAGE - Telegram Integration
   ═══════════════════════════════════════════════════════════════ */
window.buyPackage = function(serviceType, quantity, price) {
    // Show loading toast
    showToast('Opening Telegram...', 'info');
    
    fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(settings => {
            const link = settings?.telegram_link || 'https://t.me/yourchannel';
            const message = encodeURIComponent(
                `🛒 Order Request\n\n` +
                `📦 Service: ${serviceType}\n` +
                `📊 Quantity: ${quantity.toLocaleString()}\n` +
                `💰 Price: ${price.toLocaleString()} Ks\n\n` +
                `Please provide payment instructions.`
            );
            window.open(`${link}?text=${message}`, '_blank');
            showToast('Order form opened in Telegram!', 'success');
        })
        .catch(() => {
            window.open('https://t.me/yourchannel', '_blank');
        });
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU TOGGLE
   ═══════════════════════════════════════════════════════════════ */
window.toggleMobileMenu = function() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    navMenu.classList.toggle('open');
    
    // Animate hamburger to X
    const icon = toggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
        icon.className = 'bi bi-x-lg';
    } else {
        icon.className = 'bi bi-list';
    }
};

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS - Intersection Observer
   ═══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/* ═══════════════════════════════════════════════════════════════
   HEADER SCROLL EFFECT
   ═══════════════════════════════════════════════════════════════ */
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all systems
    loadSettings();
    loadPricing('all');
    initScrollAnimations();
    initHeaderScroll();
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: 100px;
                height: 100px;
                left: ${e.clientX - rect.left - 50}px;
                top: ${e.clientY - rect.top - 50}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);