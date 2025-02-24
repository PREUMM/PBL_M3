function showNotification(title, message, type = 'success') {
    const container = document.querySelector('.notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress"></div>
    `;

    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3000);
} 

// For Register Form
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showNotification(
            'Password Mismatch', 
            'Please make sure your passwords match.',
            'error'
        );
        return;
    }

    // Create user object
    const user = {
        username: username,
        email: email,
        password: password
    };

    try {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showNotification(
                'Registration Failed', 
                'This email is already registered.',
                'error'
            );
            return;
        }

        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));

        showNotification(
            'Welcome!', 
            'Your account has been created successfully.'
        );

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        showNotification(
            'Error', 
            'Something went wrong. Please try again.',
            'error'
        );
    }
});

// For Login Form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(
            'Welcome Back!', 
            'Login successful. Redirecting...'
        );
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        showNotification(
            'Login Failed', 
            'Invalid email or password.',
            'error'
        );
    }
});