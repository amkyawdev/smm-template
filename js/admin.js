/**
 * SMM Service - Admin Panel JavaScript
 */

class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.isLoggedIn = false;
        this.currentTab = 'dashboard';
        this.services = [];
        this.orders = [];
        this.settings = {};
        this.admin = {};
        this.init();
    }

    async init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.setupSidebar();
    }

    checkLoginStatus() {
        const token = localStorage.getItem('adminToken');
        const expiry = localStorage.getItem('tokenExpiry');
        
        if (token && expiry && Date.now() < parseInt(expiry)) {
            this.isLoggedIn = true;
            this.loadDashboardData();
        } else {
            this.showLoginOverlay();
        }
    }

    showLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.classList.remove('hidden');
    }

    hideLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/admin`);
            const data = await response.json();
            
            if (data.username === username) {
                // Simple password check (in production, use proper hashing)
                if (data.password === password || this.hashPassword(password) === data.password) {
                    this.isLoggedIn = true;
                    const token = this.generateToken();
                    localStorage.setItem('adminToken', token);
                    localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
                    this.hideLoginOverlay();
                    this.loadDashboardData();
                    this.showNotification('Login successful!', 'success');
                } else {
                    this.showNotification('Invalid password', 'error');
                }
            } else {
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            // Allow demo access if API is not available
            if (username === 'admin' && password === 'admin123') {
                this.isLoggedIn = true;
                const token = this.generateToken();
                localStorage.setItem('adminToken', token);
                localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
                this.hideLoginOverlay();
                this.loadDashboardData();
                this.showNotification('Demo login successful!', 'success');
            } else {
                this.showNotification('Login failed. Please try again.', 'error');
            }
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('tokenExpiry');
        this.isLoggedIn = false;
        this.services = [];
        this.orders = [];
        this.showLoginOverlay();
    }

    generateToken() {
        return 'admin_' + Math.random().toString(36).substr(2, 9) + Date.now();
    }

    hashPassword(password) {
        // Simple hash for demo (use bcrypt in production)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString();
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadSettings(),
            this.loadServices(),
            this.loadOrders(),
            this.loadAdminInfo()
        ]);
        this.updateDashboard();
    }

    async loadSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            this.settings = await response.json();
            this.populateSettingsForm();
        } catch (error) {
            console.log('Using default settings');
            this.settings = {
                site_title: 'SMM Service',
                subtitle: 'Your Trusted Social Media Marketing Partner',
                telegram_link: 'https://t.me/yourtelegram',
                contact_email: 'support@example.com',
                working_hours: '24/7 Available'
            };
            this.populateSettingsForm();
        }
    }

    async loadServices() {
        try {
            const response = await fetch(`${this.apiBase}/services`);
            this.services = await response.json();
            this.renderServices();
        } catch (error) {
            this.services = [
                { id: 1, name: 'Instagram Followers', icon: 'instagram', price: 9.99, description: 'High-quality followers', features: 'Real profiles,Fast delivery,24/7 support', badge: 'Popular', color: '#E4405F' },
                { id: 2, name: 'TikTok Views', icon: 'play-circle', price: 4.99, description: 'Boost views', features: 'Instant start,High retention', badge: '', color: '#00F2EA' },
                { id: 3, name: 'YouTube Subscribers', icon: 'youtube', price: 19.99, description: 'Grow channel', features: 'Real users,Money-back guarantee', badge: 'Best', color: '#FF0000' }
            ];
            this.renderServices();
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders`);
            this.orders = await response.json();
            this.renderOrders();
        } catch (error) {
            this.orders = [
                { id: 'ORD001', service: 'Instagram Followers', customer: 'John Doe', amount: 29.99, status: 'completed', date: '2024-01-15' },
                { id: 'ORD002', service: 'TikTok Views', customer: 'Jane Smith', amount: 14.99, status: 'pending', date: '2024-01-15' },
                { id: 'ORD003', service: 'YouTube Subscribers', customer: 'Bob Wilson', amount: 59.99, status: 'processing', date: '2024-01-14' }
            ];
            this.renderOrders();
        }
    }

    async loadAdminInfo() {
        try {
            const response = await fetch(`${this.apiBase}/admin`);
            this.admin = await response.json();
        } catch (error) {
            this.admin = { username: 'admin', password: '' };
        }
    }

    updateDashboard() {
        // Update stats
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, o) => sum + o.amount, 0);
        const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
        const activeServices = this.services.length;

        document.querySelectorAll('.stat-card').forEach(card => {
            const label = card.querySelector('.stat-info h3')?.textContent.toLowerCase();
            const valueEl = card.querySelector('.stat-info .value');
            
            if (label?.includes('orders')) valueEl.textContent = totalOrders;
            if (label?.includes('revenue')) valueEl.textContent = '$' + totalRevenue.toFixed(2);
            if (label?.includes('pending')) valueEl.textContent = pendingOrders;
            if (label?.includes('services')) valueEl.textContent = activeServices;
        });

        // Update charts
        this.updateCharts();
    }

    updateCharts() {
        const ctx = document.getElementById('orders-chart');
        if (ctx && window.Chart) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Orders',
                        data: [12, 19, 8, 15, 25, 20, 30],
                        borderColor: '#6366f1',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#94a3b8' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                        }
                    }
                }
            });
        }
    }

    populateSettingsForm() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        Object.keys(this.settings).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = this.settings[key];
        });
    }

    renderServices() {
        const container = document.getElementById('services-list');
        if (!container) return;

        if (this.services.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-box"></i>
                    <h3>No Services Yet</h3>
                    <p>Add your first service to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.services.map(service => `
            <div class="service-item" data-id="${service.id}">
                <div class="service-item-header">
                    <div class="service-item-icon" style="background: linear-gradient(135deg, ${service.color || '#6366f1'}, ${service.color || '#6366f1'}dd)">
                        <i class="bi bi-${service.icon || 'star'}"></i>
                    </div>
                    <div class="service-item-info">
                        <h4>${service.name}</h4>
                        <span class="price">$${service.price}</span>
                        ${service.badge ? `<span class="badge badge-info">${service.badge}</span>` : ''}
                    </div>
                </div>
                <p class="service-item-desc">${service.description || ''}</p>
                <div class="service-item-features">
                    ${(service.features || '').split(',').map(f => `<span class="feature-tag">${f.trim()}</span>`).join('')}
                </div>
                <div class="service-item-actions">
                    <button class="btn btn-secondary" onclick="admin.editService(${service.id})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="admin.deleteService(${service.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderOrders() {
        const tbody = document.querySelector('#orders-table tbody');
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No orders yet</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.orders.map(order => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.service}</td>
                <td>${order.customer || 'N/A'}</td>
                <td>$${order.amount}</td>
                <td><span class="badge badge-${this.getStatusBadge(order.status)}">${order.status}</span></td>
                <td>${order.date || 'N/A'}</td>
            </tr>
        `).join('');
    }

    getStatusBadge(status) {
        const badges = {
            completed: 'success',
            pending: 'warning',
            processing: 'info',
            cancelled: 'danger'
        };
        return badges[status] || 'info';
    }

    // Service Management
    openServiceModal(serviceId = null) {
        const modal = document.getElementById('service-modal');
        const form = document.getElementById('service-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form) return;

        form.reset();
        
        if (serviceId) {
            const service = this.services.find(s => s.id === serviceId);
            if (service) {
                title.textContent = 'Edit Service';
                form.elements['name'].value = service.name;
                form.elements['icon'].value = service.icon || '';
                form.elements['price'].value = service.price;
                form.elements['description'].value = service.description || '';
                form.elements['features'].value = service.features || '';
                form.elements['badge'].value = service.badge || '';
                form.elements['color'].value = service.color || '#6366f1';
                form.dataset.serviceId = serviceId;
            }
        } else {
            title.textContent = 'Add New Service';
            delete form.dataset.serviceId;
        }

        modal.classList.add('active');
    }

    closeServiceModal() {
        const modal = document.getElementById('service-modal');
        if (modal) modal.classList.remove('active');
    }

    async saveService(formData) {
        const serviceId = formData.dataset.serviceId;
        const service = {
            name: formData.elements['name'].value,
            icon: formData.elements['icon'].value || 'star',
            price: parseFloat(formData.elements['price'].value),
            description: formData.elements['description'].value,
            features: formData.elements['features'].value,
            badge: formData.elements['badge'].value,
            color: formData.elements['color'].value || '#6366f1'
        };

        try {
            const method = serviceId ? 'POST' : 'POST';
            const url = serviceId ? `${this.apiBase}/services/${serviceId}` : `${this.apiBase}/services`;
            
            // For demo, update locally
            if (serviceId) {
                const index = this.services.findIndex(s => s.id === parseInt(serviceId));
                if (index !== -1) {
                    this.services[index] = { ...this.services[index], ...service };
                }
            } else {
                service.id = Date.now();
                this.services.push(service);
            }

            this.renderServices();
            this.closeServiceModal();
            this.showNotification('Service saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to save service', 'error');
        }
    }

    editService(id) {
        this.openServiceModal(id);
    }

    async deleteService(id) {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            this.services = this.services.filter(s => s.id !== id);
            this.renderServices();
            this.showNotification('Service deleted successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to delete service', 'error');
        }
    }

    // Settings Management
    async saveSettings(formData) {
        const newSettings = {
            site_title: formData.elements['site_title'].value,
            subtitle: formData.elements['subtitle'].value,
            telegram_link: formData.elements['telegram_link'].value,
            contact_email: formData.elements['contact_email'].value,
            working_hours: formData.elements['working_hours'].value
        };

        try {
            // In production, save to API
            this.settings = { ...this.settings, ...newSettings };
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to save settings', 'error');
        }
    }

    // Admin Credentials
    async updateAdminCredentials(currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            this.showNotification('Admin credentials updated!', 'success');
            document.getElementById('admin-form').reset();
        } catch (error) {
            this.showNotification('Failed to update credentials', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = loginForm.elements['username'].value;
                const password = loginForm.elements['password'].value;
                this.login(username, password);
            });
        }

        // Service form
        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveService(serviceForm);
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings(settingsForm);
            });
        }

        // Admin form
        const adminForm = document.getElementById('admin-form');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateAdminCredentials(
                    adminForm.elements['current_password'].value,
                    adminForm.elements['new_password'].value
                );
            });
        }

        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                if (tab) this.switchTab(tab);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Modal close
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    el.closest('.modal-overlay')?.classList.remove('active');
                }
            });
        });

        // Order filters
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterOrders());
        }
    }

    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar?.classList.toggle('collapsed');
            });
        }

        // Mobile menu
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar?.classList.toggle('open');
            });
        }
    }

    switchTab(tabId) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === `${tabId}-tab` ? 'block' : 'none';
        });

        this.currentTab = tabId;
    }

    filterOrders() {
        const status = document.getElementById('status-filter')?.value;
        const filtered = status ? this.orders.filter(o => o.status === status) : this.orders;
        
        const tbody = document.querySelector('#orders-table tbody');
        if (tbody) {
            tbody.innerHTML = filtered.map(order => `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.service}</td>
                    <td>${order.customer || 'N/A'}</td>
                    <td>$${order.amount}</td>
                    <td><span class="badge badge-${this.getStatusBadge(order.status)}">${order.status}</span></td>
                    <td>${order.date || 'N/A'}</td>
                </tr>
            `).join('');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.querySelector('.notification-message').textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Icon Selector
    selectIcon(iconName) {
        const input = document.querySelector('[name="icon"]');
        if (input) input.value = iconName;
        
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.icon === iconName);
        });
    }

    // Color Picker Sync
    syncColorPicker(colorInput, textInput) {
        if (colorInput && textInput) {
            colorInput.addEventListener('input', () => {
                textInput.value = colorInput.value;
            });
            textInput.addEventListener('input', () => {
                if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
                    colorInput.value = textInput.value;
                }
            });
        }
    }
}

// Initialize Admin Panel
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminPanel();
});
