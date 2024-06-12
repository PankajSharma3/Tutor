document.addEventListener('DOMContentLoaded', () => {
    fetchSubmittedTests();
});

function fetchSubmittedTests() {
    fetch('/api/submitted-tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(tests => {
        displaySubmittedTests(tests);
    })
    .catch(error => {
        console.error('Error fetching submitted tests:', error);
    });
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

    // Add event listener to redirect to result dashboard
    card.addEventListener('click', () => {
        localStorage.setItem('test', test.test);
        window.location.href = "/result_dashboard";
    });

    return card;
}

function checkUserDetails() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = '/login';
    }
}

checkUserDetails();
