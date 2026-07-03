// Admin Panel JavaScript - Cards UI and Website Logs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    initTabs();
    initServices();
    initSettings();
    initLogs();
    initCredentials();
    showToast('Admin panel loaded successfully', 'success');
});

// Tab Navigation
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// Services Management
let services = [];

async function initServices() {
    try {
        const response = await fetch('/api/services');
        services = await response.json();
        renderServices();
    } catch (error) {
        services = [
            { id: 1, name: 'Instagram Followers', price: 9.99, description: 'High quality followers', icon: '📸' },
            { id: 2, name: 'TikTok Views', price: 4.99, description: 'Real views', icon: '🎵' },
            { id: 3, name: 'YouTube Subscribers', price: 14.99, description: 'Active subscribers', icon: '▶️' }
        ];
        renderServices();
    }
}

function renderServices() {
    const container = document.getElementById('servicesList');
    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No Services Yet</h3>
                <p>Add your first service to get started</p>
                <button class="btn btn-primary" onclick="openServiceModal()">
                    <span>+</span> Add Service
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="card" data-id="${service.id}">
            <div class="card-header">
                <h3 class="card-title">${service.icon} ${service.name}</h3>
                <span class="badge badge-primary">$${service.price}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">${service.description}</p>
            <div class="actions">
                <button class="action-btn" onclick="editService(${service.id})" title="Edit">
                    ✏️
                </button>
                <button class="action-btn delete" onclick="deleteService(${service.id})" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function openServiceModal(service = null) {
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    const title = document.getElementById('modalTitle');

    if (service) {
        title.textContent = 'Edit Service';
        form.name.value = service.name;
        form.price.value = service.price;
        form.description.value = service.description;
        form.icon.value = service.icon;
        form.dataset.id = service.id;
    } else {
        title.textContent = 'Add New Service';
        form.reset();
        delete form.dataset.id;
    }

    modal.classList.add('active');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
}

async function saveService(formData) {
    const id = formData.dataset.id;
    const service = {
        name: formData.name.value,
        price: parseFloat(formData.price.value),
        description: formData.description.value,
        icon: formData.icon.value
    };

    if (id) {
        // Update existing
        const index = services.findIndex(s => s.id == id);
        if (index !== -1) {
            services[index] = { ...services[index], ...service };
        }
        showToast('Service updated successfully', 'success');
    } else {
        // Add new
        service.id = Date.now();
        services.push(service);
        showToast('Service added successfully', 'success');
    }

    renderServices();
    closeServiceModal();
    
    // Save to server
    try {
        await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(services)
        });
    } catch (e) {
        // Silent fail - already updated locally
    }
}

function editService(id) {
    const service = services.find(s => s.id == id);
    if (service) openServiceModal(service);
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    services = services.filter(s => s.id !== id);
    renderServices();
    showToast('Service deleted successfully', 'success');
    
    try {
        await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(services)
        });
    } catch (e) {}
}

// Settings Management
function initSettings() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(settingsForm);
            const settings = Object.fromEntries(formData);
            
            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                });
                showToast('Settings saved successfully', 'success');
            } catch (error) {
                showToast('Failed to save settings', 'error');
            }
        });
    }
}

// Website Logs
let logs = [];
let filteredLogs = [];

async function initLogs() {
    try {
        const response = await fetch('/api/logs');
        logs = await response.json();
        filteredLogs = [...logs];
        renderLogs();
        updateLogStats();
    } catch (error) {
        // Demo logs
        logs = [
            { id: 1, page: '/', timestamp: new Date().toISOString(), referrer: 'direct', user_agent: 'Chrome/Windows' },
            { id: 2, page: '/about', timestamp: new Date(Date.now() - 3600000).toISOString(), referrer: 'google.com', user_agent: 'Safari/Mac' },
            { id: 3, page: '/services', timestamp: new Date(Date.now() - 7200000).toISOString(), referrer: 'twitter.com', user_agent: 'Firefox/Linux' }
        ];
        filteredLogs = [...logs];
        renderLogs();
        updateLogStats();
    }
}

function updateLogStats() {
    const totalVisits = logs.length;
    const todayVisits = logs.filter(l => {
        const logDate = new Date(l.timestamp).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
    }).length;
    
    const uniquePages = [...new Set(logs.map(l => l.page))].length;

    document.getElementById('totalVisits')?.setAttribute('data-count', totalVisits);
    document.getElementById('todayVisits')?.setAttribute('data-count', todayVisits);
    document.getElementById('uniquePages')?.setAttribute('data-count', uniquePages);
}

function renderLogs() {
    const container = document.getElementById('logsList');
    if (!container) return;

    if (filteredLogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No Logs Yet</h3>
                <p>Website visit logs will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredLogs.map(log => {
        const date = new Date(log.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        return `
            <div class="log-entry">
                <div class="log-header">
                    <span class="log-page">${log.page}</span>
                    <span class="log-time">${formattedDate}</span>
                </div>
                <div class="log-details">
                    <span>📍 ${log.referrer || 'Direct'}</span>
                    <span>🌐 ${log.user_agent || 'Unknown'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filterLogs() {
    const searchTerm = document.getElementById('logSearch')?.value.toLowerCase() || '';
    const pageFilter = document.getElementById('pageFilter')?.value || '';

    filteredLogs = logs.filter(log => {
        const matchesSearch = log.page.toLowerCase().includes(searchTerm) ||
                            (log.referrer && log.referrer.toLowerCase().includes(searchTerm));
        const matchesPage = !pageFilter || log.page === pageFilter;
        return matchesSearch && matchesPage;
    });

    renderLogs();
}

async function clearLogs() {
    if (!confirm('Are you sure you want to clear all logs? This cannot be undone.')) return;
    
    logs = [];
    filteredLogs = [];
    renderLogs();
    updateLogStats();
    showToast('Logs cleared successfully', 'success');
    
    try {
        await fetch('/api/logs', { method: 'DELETE' });
    } catch (e) {}
}

function exportLogs() {
    const csv = ['Page,Timestamp,Referrer,User Agent'];
    filteredLogs.forEach(log => {
        csv.push(`"${log.page}","${log.timestamp}","${log.referrer || ''}","${log.user_agent || ''}"`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Logs exported successfully', 'success');
}

// Credentials Management
function initCredentials() {
    const credentialsForm = document.getElementById('credentialsForm');
    if (credentialsForm) {
        credentialsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(credentialsForm);
            const credentials = Object.fromEntries(formData);
            
            if (credentials.newPassword !== credentials.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            try {
                await fetch('/api/admin/credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: credentials.username,
                        password: credentials.newPassword
                    })
                });
                showToast('Credentials updated successfully', 'success');
                credentialsForm.reset();
            } catch (error) {
                showToast('Failed to update credentials', 'error');
            }
        });
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Service form
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveService(serviceForm);
        });
    }

    // Log filters
    const logSearch = document.getElementById('logSearch');
    const pageFilter = document.getElementById('pageFilter');
    if (logSearch) logSearch.addEventListener('input', filterLogs);
    if (pageFilter) pageFilter.addEventListener('change', filterLogs);

    // Modal close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
});

// Sidebar Navigation
function navigateTo(section) {
    const tab = document.querySelector(`[data-tab="${section}"]`);
    if (tab) tab.click();
}
