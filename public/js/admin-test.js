
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(tests => {
        const testList = document.getElementById('test-list');
        tests.forEach(test => {
            const listItem = document.createElement('li');
            listItem.classList.add('test-item');
            const date = new Date(test.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const start_time = parseTime(test.start_time);
            const end_time = parseTime(test.end_time);
            listItem.innerHTML = `
                <input type="checkbox" class="delete-checkbox" style="display: none;">
                <div class="card">
                    <img src="/photo/test.png" alt="Test">
                    <div class="card-content">
                        <h3>${test.test}</h3>
                        <p class="test-info">Date: ${date}</p>
                        <p class="test-info">Start Time: ${test.start_time}</p>
                        <p class="test-info">End Time: ${test.end_time}</p>
                    </div>
                </div>
            `;
            testList.appendChild(listItem);
            const card = listItem.querySelector('.card');
            const checkbox = listItem.querySelector('.delete-checkbox');
            const testName = test.test;

            let touchStartTime;
            let longPressTimer;

            // Touch events
            if ('ontouchstart' in document.documentElement) {
                card.addEventListener('touchstart', (event) => {
                    touchStartTime = new Date().getTime();
                    longPressTimer = setTimeout(() => {
                        card.classList.add('long-press');
                        enableAllCheckboxes(checkbox);
                    }, 1000);
                });

                card.addEventListener('touchmove', (event) => {
                    clearTimeout(longPressTimer);
                });

                card.addEventListener('touchend', (event) => {
                    const touchEndTime = new Date().getTime();
                    const touchDuration = touchEndTime - touchStartTime;
                    clearTimeout(longPressTimer);

                    if (touchDuration < 1000) {
                        if (!checkbox.checked) {
                            localStorage.setItem('test', testName);
                            localStorage.setItem('start_time', start_time);
                            localStorage.setItem('end_time', end_time);
                            localStorage.setItem('date', date);
                        }
                    }
                });

                card.addEventListener('touchcancel', (event) => {
                    clearTimeout(longPressTimer);
                    card.classList.remove('long-press');
                });
            }

            // Mouse events (fallback for touch)
            card.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    card.classList.add('long-press');
                    enableAllCheckboxes(checkbox);
                }, 1000);
            });

            card.addEventListener('mouseup', () => {
                clearTimeout(longPressTimer);
            });

            card.addEventListener('mouseleave', () => {
                clearTimeout(longPressTimer);
            });

            // Click event handling
            card.addEventListener('click', (event) => {
                if (!checkbox.checked) {
                    if (!card.classList.contains('long-press')) {
                        localStorage.setItem('test', testName);
                        localStorage.setItem('start_time', start_time);
                        localStorage.setItem('end_time', end_time);
                        localStorage.setItem('date', date);
                    } else {
                        card.classList.remove('long-press');
                    }
                }
            });
        });

        // Add button functionality
        const addButton = document.getElementById('add-button');
        addButton.addEventListener('click', () => {
            window.location.href = '/test_upload';
        });

        // Delete button functionality
        const deleteButton = document.getElementById('delete-button');
        deleteButton.addEventListener('click', async () => {
            const selectedTests = document.querySelectorAll('.delete-checkbox:checked');
            const totalTests = selectedTests.length;

            if (totalTests > 0 && confirm(`Are you sure you want to delete ${totalTests} selected test(s)?`)) {
                let deletedTests = 0;

                for (const checkbox of selectedTests) {
                    const testName = checkbox.nextElementSibling.querySelector('h3').innerText;

                    try {
                        const response = await fetch(`/api/delete-tests`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ testName })
                        });

                        if (response.ok) {
                            checkbox.parentElement.remove();
                            deletedTests++;
                            if (deletedTests === totalTests) {
                                alert('All selected tests have been deleted.');
                            }
                        } else {
                            const data = await response.json();
                            throw new Error(data.message);
                        }
                    } catch (error) {
                        console.error('Error deleting test:', error);
                        alert('An error occurred while deleting the test.');
                    }
                }
            }
        });

        // Update UI based on checkbox state
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('delete-checkbox')) {
                toggleDeleteButton();
            }
        });

        // Initial UI state check
        toggleDeleteButton();
    })
    .catch(error => console.error('Error fetching tests:', error));
});

function enableAllCheckboxes(clickedCheckbox) {
    const allCheckboxes = document.querySelectorAll('.delete-checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.style.display = 'block';
        checkbox.checked = false;
    });
    clickedCheckbox.checked = true;
    toggleDeleteButton();
}

function toggleDeleteButton() {
    const checkboxes = document.querySelectorAll('.delete-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
    
    const deleteButton = document.getElementById('delete-button');
    deleteButton.style.display = checkedCheckboxes.length > 0 ? 'inline-block' : 'none';
    
    checkboxes.forEach(checkbox => {
        checkbox.style.display = checkedCheckboxes.length > 0 ? 'block' : 'none';
    });
}

function parseTime(timeString) {
    const [timePart, modifier] = timeString.split(' ');
    let [hours, minutes] = timePart.split(':');

    if (modifier === 'AM' && hours === '12') {
        hours = '00';
    } else if (modifier === 'PM' && hours !== '12') {
        hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours}:${minutes}`;
}

function checkUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: user._id }) 
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.user || data.user._id !== user._id) {
                window.location.href = '/';
            } else if (data.user.domain !== 'Admin') {
                window.location.href = '/dashboard';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/';
        });
    } else {
        window.location.href = '/'; 
    }
}
checkUserDetails();
