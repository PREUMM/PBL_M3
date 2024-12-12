// Shared animation utilities
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