document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.schedule-content');
    const container = document.querySelector('.container');
    
    // Show loading state
    loadingManager.show(mainContent);

    // Load schedule content with animation
    loadingManager.hide(container, () => {
        loadScheduleContent();
    });
});

function loadScheduleContent() {
    const scheduleContent = document.querySelector('.schedule-content');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    scheduleContent.innerHTML = `
        <div class="schedule-header">
            <h1>Your Schedule</h1>
        </div>
        
        <div class="schedule-grid">
            <!-- Schedule content here -->
        </div>
    `;
} 