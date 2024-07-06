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
            const testName = test.test;
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
            if (!data.success) {
                window.location.href = '/';
            } else {
                if (data.user.domain === 'Admin') {
                    window.location.href = '/';
                }
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

function checkSubmissionStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user._id;
    const test_name = localStorage.getItem('test');
    const date = localStorage.getItem('date');
    const start_time = localStorage.getItem('start_time');
    const end_time = localStorage.getItem('end_time');
    const current_time = new Date();
    const start_datetime = new Date(`${date} ${start_time}`);
    const end_datetime = new Date(`${date} ${end_time}`);

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