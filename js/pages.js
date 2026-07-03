// =====================================================
// PAGES.JS - About & Contact Page Functionality
// =====================================================

const API_URL = window.location.origin + '/api';

// =====================================================
// Load Contact Information
// =====================================================
async function loadContactInfo() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        // Update Telegram link
        const telegram = settings.find(s => s.setting_key === 'telegram_channel_link');
        if (telegram) {
            const telegramEl = document.getElementById('contactTelegram');
            if (telegramEl) telegramEl.textContent = telegram.setting_value;
            
            const floating = document.getElementById('telegramFloating');
            if (floating) floating.href = telegram.setting_value;
        }
        
        // Update Email
        const email = settings.find(s => s.setting_key === 'contact_email');
        if (email && document.getElementById('contactEmail')) {
            document.getElementById('contactEmail').textContent = email.setting_value;
        }
        
        // Update Phone
        const phone = settings.find(s => s.setting_key === 'contact_phone');
        if (phone && document.getElementById('contactPhone')) {
            document.getElementById('contactPhone').textContent = phone.setting_value;
        }
        
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// =====================================================
// Contact Form Handler
// =====================================================
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the Telegram link
    const telegramLink = document.getElementById('telegramFloating')?.href || 'https://t.me/yourchannel';
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name') || 'Customer';
    const email = formData.get('email') || '';
    const subject = formData.get('subject') || 'Inquiry';
    const message = formData.get('message') || '';
    
    // Open Telegram with pre-filled message
    const tgMessage = encodeURIComponent(
        `📩 New Contact Form Message\n\n` +
        `👤 Name: ${name}\n` +
        `📧 Email: ${email}\n` +
        `📝 Subject: ${subject}\n` +
        `💬 Message: ${message}\n\n` +
        `Please respond to this inquiry.`
    );
    
    window.open(`${telegramLink}?text=${tgMessage}`, '_blank');
    
    // Show success
    alert('Your message has been sent! We will get back to you soon.');
    this.reset();
});

// =====================================================
// Load Page Title and Animation
// =====================================================
async function loadPageSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        // Update title
        const title = settings.find(s => s.setting_key === 'site_title');
        if (title) {
            document.title = title.setting_value;
        }
        
        // Update header title animation
        const animation = settings.find(s => s.setting_key === 'site_title_animation');
        if (animation) {
            const headerTitle = document.querySelector('.navbar-brand .fw-bold');
            if (headerTitle) {
                headerTitle.textContent = animation.setting_value.split('|')[0] || 'SMM Service';
            }
        }
        
    } catch (error) {
        console.error('Error loading page settings:', error);
    }
}

// =====================================================
// Initialize
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    loadPageSettings();
    loadContactInfo();
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});