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
            listItem.innerHTML = `
                <div class="card">
                    <img src="/photo/test.png" alt="Test">
                    <div class="card-content">
                        <h3>${test.test}</h3>
                        <p class="test-info">Date: ${new Date(test.date).toLocaleDateString()}</p>
                        <p class="test-info">Start Time: ${test.start_time}</p>
                        <p class="test-info">End Time: ${test.end_time}</p>
                    </div>
                </div>
            `;
            testList.appendChild(listItem);
            const card = listItem.querySelector('.card');
            const testName = test.test;
            const start_time = test.start_time;
            const end_time = test.end_time;
            const date = new Date(test.date).toLocaleDateString();
            card.addEventListener('click', () => {
                localStorage.setItem('test', testName);
                localStorage.setItem('start_time', start_time);
                localStorage.setItem('end_time', end_time);
                localStorage.setItem('date', date);
                checkSubmissionStatus();
            });
        });
    })
    .catch(error => console.error('Error fetching tests:', error));
});

function checkUserDetails() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = '/login';
    }
}
checkUserDetails();

function checkSubmissionStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user._id;
    const test_name = localStorage.getItem('test');
    const test_date = new Date(localStorage.getItem('date'));
    const start_time = localStorage.getItem('start_time');
    const end_time = localStorage.getItem('end_time');
    const current_time = new Date();
    const start_datetime = new Date(`${test_date.toLocaleDateString()} ${start_time}`);
    const end_datetime = new Date(`${test_date.toLocaleDateString()} ${end_time}`);

    fetch('/api/check-submission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, test_name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.submitted === 1) {
            window.location.href = "/thanks";
        } else {
            if (current_time < start_datetime) {
                alert('The test has not started yet. Please come back at the scheduled start time.');
            } else if (current_time >= start_datetime && current_time <= end_datetime) {
                window.location.href = "/instruction";
            } else {
                alert('The test has already ended. You can no longer participate.');
            }
        }
    })
    .catch(error => {
        console.error('Error checking submission status:', error);
    });
}
