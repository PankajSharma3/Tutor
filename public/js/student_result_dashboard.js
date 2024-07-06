document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('studentId');
    
    if (!user) {
        console.error('User not found in localStorage');
        return;
    }
    const name = document.querySelector('h3');
    name.innerText = localStorage.getItem('username');
    const userId = user;
    const testName = localStorage.getItem('test');
    
    try {
        const response = await fetch('/api/get-test-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, test_name: testName })
        });

        if (response.ok) {
            const result = await response.json();
            document.querySelector('.test p:nth-child(1)').textContent = `Maximum Marks: ${result.maxMarks || 'N/A'}`;
            document.querySelector('.test p:nth-child(2)').textContent = `Total Correct answers: ${result.correct}`;
            document.querySelector('.test p:nth-child(3)').textContent = `Total Incorrect answers: ${result.incorrect}`;
            document.querySelector('.test p:nth-child(4)').textContent = `Total Skipped questions: ${result.skipped}`;
            document.querySelector('.test p:nth-child(5)').textContent = `Total Marks Scored: ${result.obtainedMarks}`;
        } else {
            console.error('Failed to fetch results:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
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