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
            if (data.success) {
                window.location.href = '/dashboard';
            } else {
                console.log('User not found or an error occurred.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}


document.addEventListener('DOMContentLoaded', function() {
    checkUserDetails();
});
