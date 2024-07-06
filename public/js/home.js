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
            if (data.success) {
                console.log(data.user.domain); 
                if (data.user._id === user._id) { 
                    if (data.user.domain === 'Admin') {
                        window.location.href = '/admin_dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                }
            } 
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/'; 
        });
    } 
}

checkUserDetails();
