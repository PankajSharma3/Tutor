document.addEventListener('DOMContentLoaded', () => {
    fetchStudentsForTest();
});

async function fetchStudentsForTest() {
    try {
        const testName = localStorage.getItem('test');
        const response = await fetch('/api/students-for-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testName })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Failed to fetch students for test:', error);
    }
}

function displayStudents(students) {
    const container = document.querySelector('.container');

    students.forEach(student => {
        const card = createStudentCard(student);
        container.appendChild(card);
    });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');

    const profileLogo = document.createElement('img');
    profileLogo.src="/photo/profile.png";
    profileLogo.alt = 'Profile Logo';
    profileLogo.classList.add('profile-logo');

    const studentName = document.createElement('h4');
    studentName.textContent = student.username;

    cardContent.appendChild(profileLogo);
    cardContent.appendChild(studentName);

    card.appendChild(cardContent);
    card.addEventListener('click', () => {
        localStorage.setItem('studentId', student._id);
        localStorage.setItem('username', student.username);
        window.location.href = "/student_result_dashboard";
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
