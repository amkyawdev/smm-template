const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Toast
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

// Check auth
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/admin/check`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminUsername').textContent = data.username || 'Admin';
            loadSettings();
            loadPricing();
        } else {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('adminPanel').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

// Login
window.handleLogin = async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = event.target.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    errorEl.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Login successful!', 'success');
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('adminUsername').textContent = data.user.username || 'Admin';
            loadSettings();
            loadPricing();
        } else {
            errorEl.textContent = data.message || 'Login failed';
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Try again.';
        errorEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
};

// Logout
window.handleLogout = async function() {
    if (!confirm('Logout?')) return;
    try {
        await fetch(`${API_URL}/admin/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {}
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
};

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        if (settings) {
            document.getElementById('siteTitle').value = settings.site_title || '';
            document.getElementById('siteSubtitle').value = settings.subtitle_text || '';
            document.getElementById('telegramLink').value = settings.telegram_link || '';
        }
    } catch (error) {
        showToast('Failed to load settings', 'error');
    }
}

// Update settings
window.updateSettings = async function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    
    const data = {
        site_title: document.getElementById('siteTitle').value,
        subtitle_text: document.getElementById('siteSubtitle').value,
        telegram_link: document.getElementById('telegramLink').value,
        floating_icon_enabled: true
    };
    
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Settings updated!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error updating settings', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
};

// Load pricing
async function loadPricing() {
    try {
        const response = await fetch(`${API_URL}/pricing`);
        const data = await response.json();
        const tbody = document.getElementById('pricingTableBody');
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">No packages</td></tr>`;
            return;
        }
        
        const colors = { followers: '#FF6B35', views: '#00bfff', likes: '#FF3366', comments: '#00ff88' };
        
        data.forEach(pkg => {
            const tr = document.createElement('tr');
            tr.dataset.id = pkg.id;
            tr.innerHTML = `
                <td><span class="service-badge" style="background:${colors[pkg.service_type] || '#FF6B35'}20;color:${colors[pkg.service_type] || '#FF6B35'}">${pkg.service_type}</span></td>
                <td class="pkg-name">${pkg.package_name}</td>
                <td class="pkg-qty">${pkg.quantity.toLocaleString()}</td>
                <td class="pkg-price">${pkg.price_kyat.toLocaleString()} Ks</td>
                <td>
                    <button class="admin-action-btn edit" onclick="editPackage(${pkg.id})"><i class="bi bi-pencil"></i></button>
                    <button class="admin-action-btn delete" onclick="deletePackage(${pkg.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Failed to load pricing', 'error');
    }
};

// Add package
window.addPackage = async function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    
    const data = {
        service_type: document.getElementById('serviceType').value,
        package_name: document.getElementById('packageName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price_kyat: parseFloat(document.getElementById('price').value)
    };
    
    if (!data.package_name || !data.quantity || !data.price_kyat) {
        showToast('Fill all fields', 'error');
        btn.disabled = false;
        btn.innerHTML = original;
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pricing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            loadPricing();
            document.getElementById('addPricingForm').reset();
            showToast('Package added!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error adding package', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
};

// Delete package
window.deletePackage = async function(id) {
    if (!confirm('Delete this package?')) return;
    try {
        const response = await fetch(`${API_URL}/pricing/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            loadPricing();
            showToast('Package deleted!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error deleting', 'error');
    }
};

// Edit package
window.editPackage = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    
    const nameCell = row.querySelector('.pkg-name');
    const qtyCell = row.querySelector('.pkg-qty');
    const priceCell = row.querySelector('.pkg-price');
    const actionsCell = row.querySelector('td:last-child');
    
    if (row.dataset.editing === 'true') {
        const name = row.querySelector('.edit-name').value;
        const qty = parseInt(row.querySelector('.edit-qty').value);
        const price = parseFloat(row.querySelector('.edit-price').value);
        
        if (!name || !qty || !price) {
            showToast('Fill all fields', 'error');
            return;
        }
        
        fetch(`${API_URL}/pricing/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ package_name: name, quantity: qty, price_kyat: price, is_active: true })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                loadPricing();
                showToast('Package updated!', 'success');
            } else {
                showToast('Failed: ' + result.message, 'error');
            }
        })
        .catch(() => showToast('Error updating', 'error'));
    } else {
        const name = nameCell.textContent.trim();
        const qty = qtyCell.textContent.trim().replace(/,/g, '');
        const price = priceCell.textContent.trim().replace(/,/g, '').replace(' Ks', '');
        
        nameCell.innerHTML = `<input class="admin-input edit-name" value="${name}" style="padding:4px 8px;width:100%;">`;
        qtyCell.innerHTML = `<input type="number" class="admin-input edit-qty" value="${qty}" style="padding:4px 8px;width:100%;">`;
        priceCell.innerHTML = `<input type="number" class="admin-input edit-price" value="${price}" style="padding:4px 8px;width:100%;">`;
        actionsCell.innerHTML = `
            <button class="admin-action-btn edit" onclick="editPackage(${id})"><i class="bi bi-check"></i></button>
            <button class="admin-action-btn delete" onclick="loadPricing()"><i class="bi bi-x"></i></button>
        `;
        row.dataset.editing = 'true';
    }
};

// Update username
window.updateUsername = async function() {
    const newUsername = document.getElementById('newUsername').value;
    if (!newUsername || newUsername.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/update-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ new_username: newUsername })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('adminUsername').textContent = result.new_username;
            document.getElementById('newUsername').value = '';
            showToast('Username updated!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error updating username', 'error');
    }
};

// Change password
window.changePassword = async function() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            showToast('Password changed!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error changing password', 'error');
    }
};

// Init
document.addEventListener('DOMContentLoaded', checkAuth);