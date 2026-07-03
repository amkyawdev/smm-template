const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

let currentFilter = 'all';

// Toast system
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
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        if (settings) {
            const titleEl = document.getElementById('siteTitle');
            if (titleEl && settings.site_title) {
                titleEl.textContent = settings.site_title;
            }
            
            const subtitleEl = document.getElementById('headerSubtitle');
            if (subtitleEl && settings.subtitle_text) {
                subtitleEl.textContent = settings.subtitle_text;
            }
            
            const heroSubtitle = document.getElementById('heroSubtitle');
            if (heroSubtitle && settings.subtitle_text) {
                heroSubtitle.textContent = settings.subtitle_text;
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

// Load pricing
async function loadPricing(type = 'all') {
    try {
        const url = type && type !== 'all' ? `${API_URL}/pricing?type=${type}` : `${API_URL}/pricing`;
        const response = await fetch(url);
        const data = await response.json();
        
        const grid = document.getElementById('pricingGrid');
        if (!grid) return;
        
        if (!data || data.length === 0) {
            grid.innerHTML = `<div class="pricing-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary);">No packages available</p>
            </div>`;
            return;
        }
        
        const icons = {
            followers: 'bi-people',
            views: 'bi-eye',
            likes: 'bi-heart',
            comments: 'bi-chat'
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
        
        for (const [serviceType, packages] of Object.entries(grouped)) {
            html += `<div style="grid-column: 1/-1;">
                <h3 style="color: ${colors[serviceType] || '#FF6B35'}; margin-bottom: 15px; font-family: 'Orbitron', sans-serif; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                    <i class="bi ${icons[serviceType] || 'bi-star'}"></i> 
                    ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
            `;
            
            packages.forEach(pkg => {
                html += `
                    <div class="pricing-card">
                        <div class="package-name">${pkg.package_name}</div>
                        <div class="quantity">${pkg.quantity.toLocaleString()}</div>
                        <div class="price">${pkg.price_kyat.toLocaleString()} <span>Ks</span></div>
                        <button class="buy-btn" onclick="buyPackage('${pkg.service_type}', ${pkg.quantity}, ${pkg.price_kyat})">
                            <i class="bi bi-cart"></i> Order Now
                        </button>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error loading pricing:', error);
        document.getElementById('pricingGrid').innerHTML = `
            <div class="pricing-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary);">Failed to load packages. Please refresh.</p>
            </div>
        `;
    }
}

// Filter pricing
window.filterPricing = function(type) {
    currentFilter = type;
    
    document.querySelectorAll('.pricing-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    loadPricing(type);
};

// Buy package
window.buyPackage = function(serviceType, quantity, price) {
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
        })
        .catch(() => {
            window.open('https://t.me/yourchannel', '_blank');
        });
};

// Mobile menu toggle
window.toggleMobileMenu = function() {
    document.querySelector('.nav-menu').classList.toggle('open');
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadPricing('all');
});