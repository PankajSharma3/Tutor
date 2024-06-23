function checkUserDetails() {
    const user=JSON.parse(localStorage.getItem('user'))
    if (user) {
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: user })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/';
            }
        })
        .catch(error => console.error('Error:', error));
    }
    else{
        window.location.href = '/';
    }
}

function checkSubmissionStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user._id;
    const test_name = localStorage.getItem('test');

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
        }
    })
    .catch(error => {
        console.error('Error checking submission status:', error);
    });
}
checkSubmissionStatus();
setInterval(checkSubmissionStatus, 1000);
checkUserDetails();


