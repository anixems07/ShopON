// Auth Logic & Notifications
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

/**
 * Toast Notification System
 * @param {string} message - The message top display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showNotification(message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconClass = type === 'success' ? 'fa-circle-check' : 
                    type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';

    notification.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="notification-content">${message}</div>
    `;

    container.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
            if (container.childNodes.length === 0) {
                container.remove();
            }
        }, 300);
    }, 4000);
}

// LOGIN FLOW
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                
                showNotification(`Welcome back, ${data.user.username}! Redirecting to home...`, 'success');
                
                // Redirect after a short delay so user sees the message
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showNotification(data.error || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Server error. Please try again later.', 'error');
        }
    });
}

// REGISTER FLOW
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Account created successfully! Redirecting to login...', 'success');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification(data.error || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Server error. Please try again later.', 'error');
        }
    });
}

/**
 * Update Navbar to show login/logout button based on auth status
 */
function updateAuthNavbar() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const navRight = document.querySelector('.nav-right');
    
    if (!navRight) return;

    // Find the login/logout link or button
    let authElement = navRight.querySelector('a[href="login.html"]') || 
                     navRight.querySelector('button#logoutBtn');

    if (token) {
        // User is logged in - show logout button
        if (!authElement || authElement.tagName === 'A') {
            // Remove old login link if it exists
            if (authElement) {
                authElement.remove();
            }
            
            // Create logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'logout-btn';
            logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
            logoutBtn.title = `Logged in as ${username}`;
            
            logoutBtn.addEventListener('click', handleLogout);
            
            // Insert before cart icon or theme toggle
            const cartLink = navRight.querySelector('a[href="cart.html"]');
            const themeToggle = navRight.querySelector('.theme-btn');
            
            if (cartLink) {
                navRight.insertBefore(logoutBtn, cartLink);
            } else if (themeToggle) {
                navRight.insertBefore(logoutBtn, themeToggle);
            } else {
                navRight.appendChild(logoutBtn);
            }
        }
    } else {
        // User is not logged in - show login link
        if (authElement && authElement.id === 'logoutBtn') {
            // Remove logout button if it exists
            authElement.remove();
        }
        
        // Create login link if it doesn't exist
        if (!navRight.querySelector('a[href="login.html"]')) {
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.innerHTML = '<i class="fa-solid fa-user"></i> Login';
            
            // Insert before cart icon or theme toggle
            const cartLink = navRight.querySelector('a[href="cart.html"]');
            const themeToggle = navRight.querySelector('.theme-btn');
            
            if (cartLink) {
                navRight.insertBefore(loginLink, cartLink);
            } else if (themeToggle) {
                navRight.insertBefore(loginLink, themeToggle);
            } else {
                navRight.appendChild(loginLink);
            }
        }
    }
}

/**
 * Handle Logout
 */
async function handleLogout() {
    try {
        const response = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        // Clear local storage regardless of response
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        if (response.ok) {
            showNotification('Logged out successfully!', 'success');
        }

        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear local storage and redirect even if there's an error
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        showNotification('Logged out successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Update navbar on page load
document.addEventListener('DOMContentLoaded', updateAuthNavbar);