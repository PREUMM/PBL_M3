class AuthSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.initializeListeners();
    }

    initializeListeners() {
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register Form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout Button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showNotification('Invalid credentials!', 'error');
            }
        } catch (error) {
            this.showNotification('An error occurred!', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            role: document.getElementById('role').value,
            subject: document.getElementById('subject').value
        };

        if (formData.password !== formData.confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(user => user.email === formData.email)) {
                this.showNotification('Email already registered!', 'error');
                return;
            }

            const newUser = {
                id: Date.now(),
                ...formData,
                joinDate: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            this.showWelcomeModal(newUser.fullName);
        } catch (error) {
            this.showNotification('Registration failed!', 'error');
        }
    }

    handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showWelcomeModal(name) {
        // Implementation of welcome modal
        // ... (previous welcome modal code)
    }
}

// Initialize Auth System
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
}); 