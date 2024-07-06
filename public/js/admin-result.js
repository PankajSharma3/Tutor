document.addEventListener('DOMContentLoaded', () => {
    fetchSubmittedTests();
});

async function fetchSubmittedTests() {
    try {
        const response = await fetch('/api/all-submitted-tests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(tests => {
            if (tests.length === 0) {
                alert('No test attempted.');
                window.location.href = '/admin_dashboard';
            } else {
                displaySubmittedTests(tests);
            }
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Failed to fetch submitted tests:', error);
    } 
}

function displaySubmittedTests(tests) {
    const container = document.querySelector('.container');

    tests.forEach(test => {
        const card = createTestCard(test);
        container.appendChild(card);
    });
}

function createTestCard(test) {
    const card = document.createElement('div');
    card.classList.add('card');

    const image = document.createElement('img');
    image.src = '/photo/test.png';
    image.alt = 'Test';
    card.appendChild(image);

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');

    const testName = document.createElement('h3');
    testName.textContent = test.test;
    cardContent.appendChild(testName);

    const dateInfo = document.createElement('p');
    dateInfo.classList.add('test-info');
    const formattedDate = new Date(test.date).toLocaleDateString();
    dateInfo.textContent = `Date: ${formattedDate}`;
    cardContent.appendChild(dateInfo);

    const startTimeInfo = document.createElement('p');
    startTimeInfo.classList.add('test-info');
    startTimeInfo.textContent = `Start Time: ${test.start_time}`;
    cardContent.appendChild(startTimeInfo);

    const endTimeInfo = document.createElement('p');
    endTimeInfo.classList.add('test-info');
    endTimeInfo.textContent = `End Time: ${test.end_time}`;
    cardContent.appendChild(endTimeInfo);

    card.appendChild(cardContent);

    card.addEventListener('click', () => {
        localStorage.setItem('test', test.test);
        window.location.href = "/admin_result_dashboard";
    });

    return card;
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