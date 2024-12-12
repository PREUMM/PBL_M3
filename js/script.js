// Store groups in localStorage
let groups = JSON.parse(localStorage.getItem('groups')) || [
    {
        id: 1,
        subject: 'Mathematics',
        location: 'Library',
        dateTime: '2024-05-28T15:00',
        description: 'Study group for calculus exam preparation'
    },
    {
        id: 2,
        subject: 'Physics',
        location: 'Online',
        dateTime: '2024-06-02T18:00',
        description: 'Discussion on quantum mechanics'
    }
];

// Store my joined groups
let myGroups = JSON.parse(localStorage.getItem('myGroups')) || [];

// Display all groups function
function displayGroups(groupsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    groupsToShow.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <h3>${group.subject}</h3>
            <p><strong>Location:</strong> ${group.location}</p>
            <p><strong>Date:</strong> ${new Date(group.dateTime).toLocaleString()}</p>
            <p>${group.description}</p>
            ${containerId === 'search-results' ? 
                `<button onclick="joinGroup(${group.id})">Join Group</button>` : 
                `<button onclick="leaveGroup(${group.id})">Leave Group</button>`}
        `;
        container.appendChild(groupCard);
    });
}

// Create new group
document.getElementById('group-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const newGroup = {
        id: Date.now(), // Use timestamp as ID
        subject: document.getElementById('subject').value,
        location: document.getElementById('location').value,
        dateTime: document.getElementById('dateTime').value,
        description: document.getElementById('description').value
    };

    groups.push(newGroup);
    localStorage.setItem('groups', JSON.stringify(groups));
    this.reset();
    alert('Group created successfully!');
});

// Search groups
function searchGroups() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredGroups = groups.filter(group => 
        group.subject.toLowerCase().includes(searchTerm) ||
        group.description.toLowerCase().includes(searchTerm)
    );
    displayGroups(filteredGroups, 'search-results');
}

// Join group
function joinGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group && !myGroups.some(g => g.id === groupId)) {
        myGroups.push(group);
        localStorage.setItem('myGroups', JSON.stringify(myGroups));
        displayGroups(myGroups, 'mygroups');
        alert('Successfully joined the group!');
    }
}

// Leave group
function leaveGroup(groupId) {
    myGroups = myGroups.filter(g => g.id !== groupId);
    localStorage.setItem('myGroups', JSON.stringify(myGroups));
    displayGroups(myGroups, 'mygroups');
    alert('Left the group successfully!');
}

// Initialize displays
window.addEventListener('load', () => {
    displayGroups(myGroups, 'mygroups');
}); 