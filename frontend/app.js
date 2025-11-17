// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// AIVA States
const AIVA_STATES = {
    IDLE: 'idle',
    RESPONSE: 'response',
    QUESTION: 'question'
};

// AIVA Image URLs (using placeholder SVG data URLs for demonstration)
const AIVA_IMAGES = {
    idle: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU1IiBmaWxsPSIjNjY3RUVBIi8+CjxjaXJjbGUgY3g9IjQ1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00MCA3NVE2MCA4NSA4MCA3NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHRleHQgeD0iNjAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkFJVkE8L3RleHQ+Cjwvc3ZnPg==',
    response: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU1IiBmaWxsPSIjNDhCQjc4Ii8+CjxjaXJjbGUgY3g9IjQ1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zNSA3MFE2MCA5MCA4NSA3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHRleHQgeD0iNjAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkFJVkE8L3RleHQ+Cjwvc3ZnPg==',
    question: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU1IiBmaWxsPSIjRjZBRDU1Ii8+CjxjaXJjbGUgY3g9IjQ1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTAiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00MCA3NVE2MCA3MCA4MCA3NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHRleHQgeD0iNjAiIHk9Ijg1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+PzwvdGV4dD4KPHRleHQgeD0iNjAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkFJVkE8L3RleHQ+Cjwvc3ZnPg=='
};

// State Management
let currentState = AIVA_STATES.IDLE;
let lastInteractionTime = Date.now();
let idleTimer = null;
let hasGreetedToday = false;
let lastPopupContent = null;

// Initialize the application
function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    setAivaState(AIVA_STATES.IDLE);
    
    // Check if we've greeted today
    const lastGreeting = localStorage.getItem('lastGreeting');
    const today = new Date().toDateString();
    
    if (lastGreeting !== today) {
        hasGreetedToday = false;
        showGreeting();
    } else {
        hasGreetedToday = true;
    }
    
    // Setup idle timer
    resetIdleTimer();
    
    // Allow Enter key to trigger search
    document.getElementById('btnInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCustomer();
        }
    });
    
    // Format phone number as user types
    document.getElementById('btnInput').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });
}

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Set AIVA state and update appearance
function setAivaState(state) {
    currentState = state;
    const aivaImage = document.getElementById('aivaImage');
    aivaImage.src = AIVA_IMAGES[state];
    
    // Add animation when state changes to response or question
    if (state === AIVA_STATES.RESPONSE || state === AIVA_STATES.QUESTION) {
        const aivaIcon = document.getElementById('aivaIcon');
        aivaIcon.classList.add('animate');
        setTimeout(() => aivaIcon.classList.remove('animate'), 3000);
        
        // Show notification badge
        document.getElementById('notificationBadge').style.display = 'block';
    }
}

// Show greeting message
async function showGreeting() {
    try {
        const response = await fetch(`${API_BASE_URL}/greeting`);
        const data = await response.json();
        
        const content = `
            <div class="greeting-message">
                <p>${data.message}</p>
            </div>
        `;
        
        showAivaPopup(content);
        
        // Mark that we've greeted today
        localStorage.setItem('lastGreeting', new Date().toDateString());
        hasGreetedToday = true;
    } catch (error) {
        console.error('Error fetching greeting:', error);
    }
}

// Search for customer information
async function searchCustomer() {
    const btnInput = document.getElementById('btnInput');
    const errorMessage = document.getElementById('errorMessage');
    const btn = btnInput.value.trim();
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Validate input
    if (!btn) {
        errorMessage.textContent = 'Please enter a phone number/BTN/account number';
        return;
    }
    
    if (!/^\d{10}$/.test(btn)) {
        errorMessage.textContent = 'Please enter a valid 10-digit number';
        return;
    }
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/customer/${btn}`);
        const data = await response.json();
        
        if (data.found) {
            // Customer found - show response
            displayCustomerInfo(data);
            setAivaState(AIVA_STATES.RESPONSE);
        } else {
            // Customer not found
            displayNotFound(data.message);
            setAivaState(AIVA_STATES.QUESTION);
        }
        
        // Reset idle timer
        resetIdleTimer();
        
    } catch (error) {
        console.error('Error searching customer:', error);
        errorMessage.textContent = 'An error occurred while searching. Please try again.';
        setAivaState(AIVA_STATES.QUESTION);
    } finally {
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
    }
}

// Display customer information
function displayCustomerInfo(data) {
    const content = `
        <div class="customer-info">
            <div class="info-row">
                <span class="info-label">BTN/Phone Number:</span>
                <span class="info-value">${data.btn}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Customer Name:</span>
                <span class="info-value">${data.customer_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Balance Due:</span>
                <span class="info-value balance-due">$${data.balance_due}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date of Previous Call:</span>
                <span class="info-value">${data.date_of_previous_call || 'N/A'}</span>
            </div>
            
            <div class="synopsis-section">
                <h4>Previous Call Details:</h4>
                <p class="synopsis-text">${data.previous_call_details}</p>
            </div>
            
            <div class="resolution-section">
                <h4>Call Resolution:</h4>
                <p style="color: #4a5568; margin-bottom: 12px;">The source(s) provided below will show how the customer's most recent reason for calling could be resolved.</p>
                ${data.resolution_articles.map(article => `
                    <a href="${article.url}" target="_blank" class="article-link">
                        📄 ${article.title}
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    
    lastPopupContent = content;
    showAivaPopup(content);
}

// Display not found message
function displayNotFound(message) {
    const content = `
        <div class="not-found-message">
            <p>${message}</p>
        </div>
    `;
    
    lastPopupContent = content;
    showAivaPopup(content);
}

// Show AIVA popup
function showAivaPopup(content) {
    const popup = document.getElementById('aivaPopup');
    const overlay = document.getElementById('overlay');
    const popupContent = document.getElementById('popupContent');
    
    popupContent.innerHTML = content;
    popup.style.display = 'block';
    overlay.classList.add('active');
    
    // Hide notification badge
    document.getElementById('notificationBadge').style.display = 'none';
}

// Toggle AIVA popup
function toggleAivaPopup() {
    const popup = document.getElementById('aivaPopup');
    
    if (popup.style.display === 'block') {
        closeAivaPopup();
    } else {
        // Show last content or greeting
        if (lastPopupContent) {
            showAivaPopup(lastPopupContent);
        } else if (!hasGreetedToday) {
            showGreeting();
        } else {
            showAivaPopup('<div class="greeting-message"><p>How can I help you today?</p></div>');
        }
    }
}

// Close AIVA popup
function closeAivaPopup() {
    const popup = document.getElementById('aivaPopup');
    const overlay = document.getElementById('overlay');
    
    popup.style.display = 'none';
    overlay.classList.remove('active');
}

// Reset idle timer
function resetIdleTimer() {
    lastInteractionTime = Date.now();
    
    if (idleTimer) {
        clearTimeout(idleTimer);
    }
    
    idleTimer = setTimeout(() => {
        // Return to idle state after timeout
        setAivaState(AIVA_STATES.IDLE);
        lastPopupContent = null;
        closeAivaPopup();
    }, IDLE_TIMEOUT);
}

// Track user activity to reset idle timer
document.addEventListener('click', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
