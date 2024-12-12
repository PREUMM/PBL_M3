// Utility function for loading states
const loadingManager = {
    show: (element) => {
        element.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading content...</p>
            </div>
        `;
    },
    
    hide: (container, callback) => {
        setTimeout(() => {
            callback();
            container.classList.add('loaded');
        }, 300);
    }
};

// Content manager
const contentManager = {
    loadHome: () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        return `
            <div class="welcome-section">
                <h1>Welcome, ${currentUser.username || 'Student'}!</h1>
                <p>Find your perfect study group or create a new one.</p>
            </div>
            
            <div class="quick-actions">
                <a href="create-group.html" class="action-card">
                    <i class="fas fa-plus"></i>
                    <h3>Create Group</h3>
                    <p>Start a new study group</p>
                </a>
                <a href="groups.html" class="action-card">
                    <i class="fas fa-users"></i>
                    <h3>Join Group</h3>
                    <p>Find existing study groups</p>
                </a>
            </div>
        `;
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const container = document.querySelector('.container');
    
    // Show loading state
    loadingManager.show(mainContent);

    // Load content with animation
    loadingManager.hide(container, () => {
        mainContent.innerHTML = contentManager.loadHome();
    });
});

// Add event listeners for interactive elements
document.addEventListener('click', function(e) {
    // Delegate click events here if needed
    if (e.target.matches('.action-card')) {
        e.target.classList.add('clicked');
    }
});

// Handle page transitions
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-exit');
}); 