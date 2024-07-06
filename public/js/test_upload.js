document.addEventListener('DOMContentLoaded', () => {
    let questionIndex = 1;

    document.getElementById('addQuestion').addEventListener('click', () => {
        const questionsDiv = document.getElementById('questions');
        const newQuestionDiv = document.createElement('div');
        newQuestionDiv.className = 'question';

        newQuestionDiv.innerHTML = `
            <h3>Question ${questionIndex + 1}</h3>
            <label for="question${questionIndex}">Question:</label>
            <input type="text" id="question${questionIndex}" name="questions[${questionIndex}][text]" required>

            <label for="option${questionIndex}_1">Option 1:</label>
            <input type="text" id="option${questionIndex}_1" name="questions[${questionIndex}][options][0]" required>

            <label for="option${questionIndex}_2">Option 2:</label>
            <input type="text" id="option${questionIndex}_2" name="questions[${questionIndex}][options][1]" required>

            <label for="option${questionIndex}_3">Option 3:</label>
            <input type="text" id="option${questionIndex}_3" name="questions[${questionIndex}][options][2]" required>

            <label for="option${questionIndex}_4">Option 4:</label>
            <input type="text" id="option${questionIndex}_4" name="questions[${questionIndex}][options][3]" required>

            <label for="correctAnswer${questionIndex}">Correct Answer:</label>
            <input type="text" id="correctAnswer${questionIndex}" name="questions[${questionIndex}][correctAnswer]" required>
        `;

        questionsDiv.appendChild(newQuestionDiv);
        questionIndex++;
    });

    document.getElementById('testForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formJSON = {};

        formData.forEach((value, key) => {
            const keys = key.split('[').map(k => k.replace(']', ''));
            keys.reduce((acc, k, i) => {
                if (i === keys.length - 1) {
                    acc[k] = value;
                } else {
                    acc[k] = acc[k] || (isNaN(keys[i + 1]) ? {} : []);
                }
                return acc[k];
            }, formJSON);
        });

        console.log('Form data in JSON format:', formJSON);

        try {
            const response = await fetch('/api/save-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formJSON)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving test:', error);
            alert('Error saving test');
        }
    });
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