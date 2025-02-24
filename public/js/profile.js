document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.profile-content');
    const container = document.querySelector('.container');
    
    // Show loading state
    loadingManager.show(mainContent);

    // Load profile content with animation
    loadingManager.hide(container, () => {
        loadProfileContent();
    });
});

function loadProfileContent() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileContent = document.querySelector('.profile-content');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    profileContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <h1>${currentUser.username || 'Student'}</h1>
        </div>
        
        <div class="profile-details">
            <!-- Profile content here -->
        </div>
    `;
} 