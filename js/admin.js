/* ═══════════════════════════════════════════════════════════════
   SMM PRO - Admin Panel JavaScript
   Smooth Animations & Micro-interactions
   ═══════════════════════════════════════════════════════════════ */

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

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
   AUTHENTICATION
   ═══════════════════════════════════════════════════════════════ */
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/admin/check`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            // Animate login screen out
            const loginScreen = document.getElementById('loginScreen');
            loginScreen.style.animation = 'fadeOut 0.3s ease forwards';
            
            setTimeout(() => {
                loginScreen.style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                document.getElementById('adminPanel').style.animation = 'fadeIn 0.5s ease forwards';
                document.getElementById('adminUsername').textContent = data.username || 'Admin';
                loadSettings();
                loadPricing();
            }, 300);
        } else {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('adminPanel').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN HANDLER
   ═══════════════════════════════════════════════════════════════ */
window.handleLogin = async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    
    // Add loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Logging in...';
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
            showToast('<i class="bi bi-check-circle-fill"></i> Login successful!', 'success');
            
            // Animate transition
            const loginScreen = document.getElementById('loginScreen');
            loginScreen.style.animation = 'fadeOut 0.3s ease forwards';
            
            setTimeout(() => {
                loginScreen.style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                document.getElementById('adminUsername').textContent = data.user.username || 'Admin';
                loadSettings();
                loadPricing();
            }, 300);
        } else {
            errorEl.textContent = data.message || 'Login failed. Please check your credentials.';
            errorEl.style.display = 'block';
            errorEl.style.animation = 'shake 0.5s ease';
        }
    } catch (error) {
        errorEl.innerHTML = '<i class="bi bi-wifi-off"></i> Connection error. Please try again.';
        errorEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
};

/* ═══════════════════════════════════════════════════════════════
   LOGOUT HANDLER
   ═══════════════════════════════════════════════════════════════ */
window.handleLogout = async function() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    showToast('<i class="bi bi-box-arrow-right"></i> Logging out...', 'info');
    
    try {
        await fetch(`${API_URL}/admin/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {}
    
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.style.animation = 'fadeOut 0.3s ease forwards';
    
    setTimeout(() => {
        adminPanel.style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginScreen').style.animation = 'fadeIn 0.5s ease forwards';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }, 300);
};

/* ═══════════════════════════════════════════════════════════════
   SETTINGS MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        if (settings) {
            // Animate input fields
            ['siteTitle', 'siteSubtitle', 'telegramLink'].forEach((id, index) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateX(-10px)';
                    setTimeout(() => {
                        el.value = settings[id.replace(/([A-Z])/g, '_$1').toLowerCase()] || '';
                        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateX(0)';
                    }, index * 100);
                }
            });
        }
    } catch (error) {
        showToast('Failed to load settings', 'error');
    }
}

window.updateSettings = async function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Saving...';
    
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
            showToast('<i class="bi bi-check-circle-fill"></i> Settings updated successfully!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('<i class="bi bi-x-circle-fill"></i> Error updating settings', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
};

/* ═══════════════════════════════════════════════════════════════
   PRICING MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
async function loadPricing() {
    const tbody = document.getElementById('pricingTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:40px;">
                <span class="spinner" style="margin:0 auto;"></span>
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch(`${API_URL}/pricing`);
        const data = await response.json();
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:40px;color:var(--text-secondary);">
                        <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                        No packages found
                    </td>
                </tr>
            `;
            return;
        }
        
        const colors = { 
            followers: '#FF6B35', 
            views: '#00bfff', 
            likes: '#FF3366', 
            comments: '#00ff88' 
        };
        
        const icons = { 
            followers: 'bi-people-fill', 
            views: 'bi-eye-fill', 
            likes: 'bi-heart-fill', 
            comments: 'bi-chat-left-text-fill' 
        };
        
        data.forEach((pkg, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = pkg.id;
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(10px)';
            tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            tr.innerHTML = `
                <td>
                    <span class="service-badge ${pkg.service_type}">
                        <i class="bi ${icons[pkg.service_type] || 'bi-star-fill'}"></i>
                        ${pkg.service_type}
                    </span>
                </td>
                <td class="pkg-name">${pkg.package_name}</td>
                <td class="pkg-qty">${pkg.quantity.toLocaleString()}</td>
                <td class="pkg-price">${pkg.price_kyat.toLocaleString()} Ks</td>
                <td>
                    <button class="admin-action-btn edit" onclick="editPackage(${pkg.id})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="admin-action-btn delete" onclick="deletePackage(${pkg.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
            
            // Staggered animation
            setTimeout(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, index * 50);
        });
    } catch (error) {
        showToast('Failed to load pricing', 'error');
    }
}

window.addPackage = async function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span>';
    
    const data = {
        service_type: document.getElementById('serviceType').value,
        package_name: document.getElementById('packageName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price_kyat: parseFloat(document.getElementById('price').value)
    };
    
    if (!data.package_name || !data.quantity || !data.price_kyat) {
        showToast('Please fill all required fields', 'error');
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
            showToast('<i class="bi bi-check-circle-fill"></i> Package added successfully!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('<i class="bi bi-x-circle-fill"></i> Error adding package', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
};

window.deletePackage = async function(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    showToast('Deleting package...', 'info');
    
    try {
        const response = await fetch(`${API_URL}/pricing/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    loadPricing();
                }, 300);
            }
            showToast('<i class="bi bi-check-circle-fill"></i> Package deleted!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('<i class="bi bi-x-circle-fill"></i> Error deleting package', 'error');
    }
};

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
            showToast('Please fill all fields', 'error');
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
                showToast('<i class="bi bi-check-circle-fill"></i> Package updated!', 'success');
            } else {
                showToast('Failed: ' + result.message, 'error');
            }
        })
        .catch(() => showToast('Error updating package', 'error'));
    } else {
        const name = nameCell.textContent.trim();
        const qty = qtyCell.textContent.trim().replace(/,/g, '');
        const price = priceCell.textContent.trim().replace(/,/g, '').replace(' Ks', '');
        
        nameCell.innerHTML = `<input type="text" class="admin-input edit-name" value="${name}" style="padding:8px 12px;">`;
        qtyCell.innerHTML = `<input type="number" class="admin-input edit-qty" value="${qty}" style="padding:8px 12px;">`;
        priceCell.innerHTML = `<input type="number" class="admin-input edit-price" value="${price}" style="padding:8px 12px;">`;
        actionsCell.innerHTML = `
            <button class="admin-action-btn edit" onclick="editPackage(${id})">
                <i class="bi bi-check-lg"></i>
            </button>
            <button class="admin-action-btn delete" onclick="loadPricing()">
                <i class="bi bi-x-lg"></i>
            </button>
        `;
        row.dataset.editing = 'true';
        
        // Focus first input
        nameCell.querySelector('input').focus();
    }
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN SETTINGS
   ═══════════════════════════════════════════════════════════════ */
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
            showToast('<i class="bi bi-check-circle-fill"></i> Username updated!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error updating username', 'error');
    }
};

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
            showToast('<i class="bi bi-check-circle-fill"></i> Password changed successfully!', 'success');
        } else {
            showToast('Failed: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error changing password', 'error');
    }
};

/* ═══════════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add shake animation for errors
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
});