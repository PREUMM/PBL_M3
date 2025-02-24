console.log("IVE PLAYED THESE GAMES BEFORE");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function fetchGroups() {
  const data = await fetchData("/api/db/allGroups");
  localStorage.setItem("studyGroups", JSON.stringify(data));
}

fetchGroups()

document.addEventListener('DOMContentLoaded', function() {
    const groupsGrid = document.getElementById('groupsGrid');
    const container = document.querySelector('.groups-container');

    // Show loading state first
    groupsGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading study groups...</p>
        </div>
    `;

    // Very quick loading delay (0.3 seconds)
    setTimeout(() => {
        const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];

        if (groups.length === 0) {
            groupsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>No Active Study Groups</h3>
                    <p>Be the first to create a study group!</p>
                </div>
            `;
        } else {
            displayGroups(groups);
        }

        // Add 'loaded' class to trigger animations
        container.classList.add('loaded');
    }, 250); // Changed from 800 to 300 milliseconds

    // Add search functionality
    document.getElementById('searchGroups').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterGroups(searchTerm);
    });
});

function loadGroups() {
    const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];

    if (groups.length === 0) {
        showEmptyState();
    } else {
        displayGroups(groups);
    }
}

function showEmptyState() {
    const groupsGrid = document.getElementById('groupsGrid');
    groupsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-users-slash"></i>
            <h3>No Study Groups Found</h3>
            <p>Be the first to create a study group!</p>
            <a href="create-group.html" class="create-new-group">
                <i class="fas fa-plus"></i>
                Create New Group
            </a>
        </div>
    `;
}

function filterGroups(searchTerm) {
    const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const levelFilter = document.getElementById('levelFilter').value;

    const filteredGroups = groups.filter(group => {
        const matchesSearch =
            group.name.toLowerCase().includes(searchTerm) ||
            group.subject.toLowerCase().includes(searchTerm) ||
            group.description.toLowerCase().includes(searchTerm);

        const matchesLevel = !levelFilter || group.level === levelFilter;

        return matchesSearch && matchesLevel;
    });

    if (filteredGroups.length === 0) {
        const groupsGrid = document.getElementById('groupsGrid');
        groupsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>Try different keywords or filters</p>
            </div>
        `;
    } else {
        displayGroups(filteredGroups);
    }
}

function displayGroups(groups) {
    const groupsGrid = document.getElementById('groupsGrid');
    groupsGrid.style.opacity = '0';

    const html = groups.map(group => {
        const isJoined = group.members.includes(currentUser.email);
        const memberCount = group.members.length;
        const maxMembers = group.maxmembers;
        const isFull = memberCount >= maxMembers;
        const capacityPercentage = (memberCount / maxMembers) * 100;

        let capacityClass = 'capacity-low';
        if (capacityPercentage >= 80) {
            capacityClass = 'capacity-high';
        } else if (capacityPercentage >= 50) {
            capacityClass = 'capacity-medium';
        }

        return `
            <div class="group-card ${isFull ? 'group-full' : ''}"
                 data-group-name="${group.name.toLowerCase()}"
                 data-group-subject="${group.subject.toLowerCase()}">
                ${isFull ? '<span class="group-full-badge">FULL</span>' : ''}
                <div class="group-header">
                    <h3>${group.name}</h3>
                    <span class="subject-tag">${group.subject}</span>
                </div>
                <div class="group-info">
                    <p><i class="fas fa-clock"></i> ${group.meetingday}s at ${group.meetingtime}</p>
                    <p><i class="fas fa-signal"></i> Level: ${group.level}</p>

                    <div class="capacity-indicator ${capacityClass}">
                        <div class="capacity-status">
                            <span>Group Capacity</span>
                            <span>${memberCount}/${group.maxmembers} members</span>
                        </div>
                        <div class="capacity-bar">
                            <div class="capacity-fill" style="--capacity-percentage: ${capacityPercentage}%"></div>
                        </div>
                    </div>
                </div>

                <button
                    onclick="handleGroupAction('${group.id}', ${isJoined})"
                    class="${isJoined ? 'leave-btn' : 'join-btn'}"
                    ${!isJoined && isFull ? 'disabled' : ''}>
                    ${isJoined ?
                        '<i class="fas fa-sign-out-alt"></i> Leave' :
                        (isFull ?
                            '<i class="fas fa-lock"></i> Full' :
                            '<i class="fas fa-sign-in-alt"></i> Join'
                        )
                    }
                </button>
                ${isJoined ? `<button class="leave-btn" onclick="chatpage(${group.id})"> <i class="fa-regular fa-comment"></i> Chat </button>` : ''}
            </div>
        `;
    }).join('');

    groupsGrid.innerHTML = html;

    // Trigger reflow for animation
    void groupsGrid.offsetWidth;
    groupsGrid.style.opacity = '1';

    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.group-card').forEach(card => {
        observer.observe(card);
    });
}

function chatpage(group) {
  window.location.href = "/groups/" + group
}

function showPopupDetails(groupId) {
    const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const group = groups.find(g => g.id === groupId);

    if (!group) return;

    document.getElementById('popupGroupName').textContent = group.name;
    document.getElementById('popupSubject').textContent = group.subject;
    document.getElementById('popupTime').textContent = `${group.meetingDay}s at ${group.meetingTime}`;
    document.getElementById('popupMembers').textContent = `${group.members.length} members`;
    document.getElementById('popupLevel').textContent = group.level || 'All Levels';
    document.getElementById('popupDescription').textContent = group.description || 'No description available.';

    document.getElementById('groupPopup').style.display = 'block';
}

function handleGroupAction(groupId, isJoined) {
    const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !currentUser.email) {
        console.error("User not logged in or missing email.");
        return;
    }

    const groupIndex = groups.findIndex(g => g.id === Number(groupId));
    console.log(groups, groupId);

    if (groupIndex === -1) {
        console.error(`Group with ID ${groupId} not found.`);
        return;
    }

    const userAction = {
        email: currentUser.email,
        uid: currentUser.id,
        group: groupId
    };

    if (isJoined) {
        // Leave group
        groups[groupIndex].members = groups[groupIndex].members.filter(
            member => member !== currentUser.email
        );
        fetch("/api/db/leaveGroup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userAction),
        }).catch(error => console.error("Error leaving group:", error));
    } else {
        // Join group
        if (!groups[groupIndex].members.includes(currentUser.email)) {
            groups[groupIndex].members.push(currentUser.email);
            fetch("/api/db/joinGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userAction),
            }).catch(error => console.error("Error joining group:", error));
        } else {
            console.warn("User is already a member of this group.");
        }
    }

    // Update localStorage and UI
    localStorage.setItem('studyGroups', JSON.stringify(groups));
    loadGroups();
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// document.getElementById('createGroupForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//
//     const newGroup = {
//         id: Date.now().toString(),
//         name: document.getElementById('groupName').value,
//         subject: document.getElementById('subject').value,
//         meetingDay: document.getElementById('meetingDay').value,
//         meetingTime: document.getElementById('meetingTime').value,
//         description: document.getElementById('description').value,
//         level: document.getElementById('level').value,
//         maxMembers: parseInt(document.getElementById('maxMembers').value),
//         createdBy: JSON.parse(localStorage.getItem('currentUser')).email,
//         members: [JSON.parse(localStorage.getItem('currentUser')).email]
//     };
//
//     // Get existing groups or initialize empty array
//     const existingGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//
//     // Add new group
//     existingGroups.push(newGroup);
//
//     // Save back to localStorage
//     localStorage.setItem('studyGroups', JSON.stringify(existingGroups));
//
//     // Redirect to groups page
//     window.location.href = 'groups.html';
// });

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();

    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;

    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', createRipple);
});


// // console.log("group.js");
// async function fetchData(url) {
//     const response = await fetch(url);
//     if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return response.json(); // Convert to JSON
// }
//
// async function fetchGroups() {
//   const data = await fetchData("/api/db/allGroups");
//   localStorage.setItem("studyGroups", JSON.stringify(data));
// }
//
// fetchGroups()
//
// document.addEventListener('DOMContentLoaded', function() {
//     const groupsGrid = document.getElementById('groupsGrid');
//     const container = document.querySelector('.groups-container');
//
//     // Show loading state first
//     groupsGrid.innerHTML = `
//         <div class="loading-state">
//             <div class="loading-spinner"></div>
//             <p>Loading study groups...</p>
//         </div>
//     `;
//
//     // Very quick loading delay (0.3 seconds)
//     setTimeout(() => {
//         const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//
//         if (groups.length === 0) {
//             groupsGrid.innerHTML = `
//                 <div class="empty-state">
//                     <i class="fas fa-users-slash"></i>
//                     <h3>No Active Study Groups</h3>
//                     <p>Be the first to create a study group!</p>
//                 </div>
//             `;
//         } else {
//             displayGroups(groups);
//         }
//
//         // Add 'loaded' class to trigger animations
//         container.classList.add('loaded');
//     }, 300); // Changed from 800 to 300 milliseconds
//
//     // Add search functionality
//     document.getElementById('searchGroups').addEventListener('input', function(e) {
//         const searchTerm = e.target.value.toLowerCase();
//         filterGroups(searchTerm);
//     });
// });
//
// function loadGroups() {
//     const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//
//     if (groups.length === 0) {
//         showEmptyState();
//     } else {
//         displayGroups(groups);
//     }
// }
//
// function showEmptyState() {
//     const groupsGrid = document.getElementById('groupsGrid');
//     groupsGrid.innerHTML = `
//         <div class="empty-state">
//             <i class="fas fa-users-slash"></i>
//             <h3>No Study Groups Found</h3>
//             <p>Be the first to create a study group!</p>
//             <a href="create-group.html" class="create-new-group">
//                 <i class="fas fa-plus"></i>
//                 Create New Group
//             </a>
//         </div>
//     `;
// }
//
// function filterGroups(searchTerm) {
//     const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//     const levelFilter = document.getElementById('levelFilter').value;
//
//     const filteredGroups = groups.filter(group => {
//         const matchesSearch =
//             group.name.toLowerCase().includes(searchTerm) ||
//             group.subject.toLowerCase().includes(searchTerm) ||
//             group.description.toLowerCase().includes(searchTerm);
//
//         const matchesLevel = !levelFilter || group.level === levelFilter;
//
//         return matchesSearch && matchesLevel;
//     });
//
//     if (filteredGroups.length === 0) {
//         const groupsGrid = document.getElementById('groupsGrid');
//         groupsGrid.innerHTML = `
//             <div class="empty-state">
//                 <i class="fas fa-search"></i>
//                 <h3>No Results Found</h3>
//                 <p>Try different keywords or filters</p>
//             </div>
//         `;
//     } else {
//         displayGroups(filteredGroups);
//     }
// }
//
// function displayGroups(groups) {
//     const groupsGrid = document.getElementById('groupsGrid');
//     groupsGrid.style.opacity = '0';
//     const html = groups.map(group => {
//         // ✅ Check if properties exist, use defaults if missing
//         const name = group.name || 'Unknown Group';
//         const subject = group.subject || 'Unknown Subject';
//         const meetingDay = group.meetingday || 'Unknown Day'; // 🔥 Fix case sensitivity
//         const meetingTime = group.meetingtime || 'Unknown Time'; // 🔥 Fix case sensitivity
//         const level = group.level || 'N/A';
//         const members = Array.isArray(group.members) ? group.members : [];
//         const memberCount = members.length;
//         const maxMembers = group.maxMembers || 10; // 🔥 Default to 10 if undefined
//         const isJoined = members.includes(currentUser.email);
//         const isFull = memberCount >= maxMembers;
//         const capacityPercentage = (memberCount / maxMembers) * 100;
//         console.log("Groups Data:", groups);
//         console.log(meetingDay);
//
//         let capacityClass = 'capacity-low';
//         if (capacityPercentage >= 80) {
//             capacityClass = 'capacity-high';
//         } else if (capacityPercentage >= 50) {
//             capacityClass = 'capacity-medium';
//         }
//
//         return `
//             <div class="group-card ${isFull ? 'group-full' : ''}"
//                  data-group-name="${name.toLowerCase()}"
//                  data-group-subject="${subject.toLowerCase()}">
//                 ${isFull ? '<span class="group-full-badge">FULL</span>' : ''}
//                 <div class="group-header">
//                     <h3>${name}</h3>
//                     <span class="subject-tag">${subject}</span>
//                 </div>
//                 <div class="group-info">
//                     <p><i class="fas fa-clock"></i> ${meetingDay}s at ${meetingTime}</p>
//                     <p><i class="fas fa-signal"></i> Level: ${level}</p>
//
//                     <div class="capacity-indicator ${capacityClass}">
//                         <div class="capacity-status">
//                             <span>Group Capacity</span>
//                             <span>${memberCount}/${maxMembers} members</span>
//                         </div>
//                         <div class="capacity-bar">
//                             <div class="capacity-fill" style="width: ${capacityPercentage}%;"></div>
//                         </div>
//                     </div>
//                 </div>
//
//                 <button
//                     onclick="handleGroupAction('${group.id}', ${isJoined ? 'true' : 'false'})"
//                     class="${isJoined ? 'leave-btn' : 'join-btn'}"
//                     ${!isJoined && isFull ? 'disabled' : ''}>
//                     ${isJoined ?
//                         '<i class="fas fa-sign-out-alt"></i> Leave' :
//                         (isFull ?
//                             '<i class="fas fa-lock"></i> Full' :
//                             '<i class="fas fa-sign-in-alt"></i> Join'
//                         )
//                     }
//                 </button>
//             </div>
//         `;
//     }).join('');
//
//     groupsGrid.innerHTML = html;
//
//     // Trigger reflow for animation
//     void groupsGrid.offsetWidth;
//     groupsGrid.style.opacity = '1';
//
//     // Add intersection observer for scroll animations
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('visible');
//                 observer.unobserve(entry.target);
//             }
//         });
//     }, {
//         threshold: 0.1
//     });
//
//     document.querySelectorAll('.group-card').forEach(card => {
//         observer.observe(card);
//     });
// }
//
// function showPopupDetails(groupId) {
//     const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//     const group = groups.find(g => g.id === groupId);
//
//     if (!group) return;
//
//     document.getElementById('popupGroupName').textContent = group.name;
//     document.getElementById('popupSubject').textContent = group.subject;
//     document.getElementById('popupTime').textContent = `${group.meetingDay}s at ${group.meetingTime}`;
//     document.getElementById('popupMembers').textContent = `${group.members.length} members`;
//     document.getElementById('popupLevel').textContent = group.level || 'All Levels';
//     document.getElementById('popupDescription').textContent = group.description || 'No description available.';
//
//     document.getElementById('groupPopup').style.display = 'block';
// }
//
// function handleGroupAction(groupId, isJoined) {
//     const groups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//
//     const groupIndex = groups.findIndex(g => g.id === groupId);
//
//     if (groupIndex !== -1) {
//         if (isJoined) {
//             groups[groupIndex].members = groups[groupIndex].members.filter(
//                 member => member !== currentUser.email
//             );
//         } else {
//             groups[groupIndex].members.push(currentUser.email);
//         }
//
//         localStorage.setItem('studyGroups', JSON.stringify(groups));
//         loadGroups();
//     }
// }
//
// // Logout functionality
// document.getElementById('logoutBtn').addEventListener('click', function() {
//     localStorage.removeItem('currentUser');
//     window.location.href = 'login.html';
// });
//
// document.getElementById('createGroupForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//
//     const newGroup = {
//         id: Date.now().toString(),
//         name: document.getElementById('groupName').value,
//         subject: document.getElementById('subject').value,
//         meetingDay: document.getElementById('meetingDay').value,
//         meetingTime: document.getElementById('meetingTime').value,
//         description: document.getElementById('description').value,
//         level: document.getElementById('level').value,
//         maxMembers: parseInt(document.getElementById('maxMembers').value),
//         createdBy: JSON.parse(localStorage.getItem('currentUser')).email,
//         members: [JSON.parse(localStorage.getItem('currentUser')).email]
//     };
//
//     // Get existing groups or initialize empty array
//     const existingGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
//
//     // Add new group
//     existingGroups.push(newGroup);
//
//     // Save back to localStorage
//     localStorage.setItem('studyGroups', JSON.stringify(existingGroups));
//
//     // Redirect to groups page
//     window.location.href = 'groups.html';
// });
//
// // Add smooth scrolling for anchor links
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         document.querySelector(this.getAttribute('href')).scrollIntoView({
//             behavior: 'smooth'
//         });
//     });
// });
//
// // Add ripple effect to buttons
// function createRipple(event) {
//     const button = event.currentTarget;
//     const ripple = document.createElement('span');
//     const rect = button.getBoundingClientRect();
//
//     ripple.className = 'ripple';
//     ripple.style.left = `${event.clientX - rect.left}px`;
//     ripple.style.top = `${event.clientY - rect.top}px`;
//
//     button.appendChild(ripple);
//
//     ripple.addEventListener('animationend', () => {
//         ripple.remove();
//     });
// }
//
// document.querySelectorAll('button').forEach(button => {
//     button.addEventListener('click', createRipple);
// });
