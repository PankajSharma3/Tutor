document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let quizData = [];
    let userId = JSON.parse(localStorage.getItem('user'))._id;
    let testName = localStorage.getItem('test');

    async function fetchQuestions() {
        try {
            const response = await fetch('/api/ans-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, testName })
            });
            quizData = await response.json();
            loadQuestion(currentQuestionIndex);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    function loadQuestion(index) {
        if (quizData.length === 0) return;
        const questionData = quizData[index];
        document.getElementById('quiz-question').textContent = `Question ${currentQuestionIndex+1}: ${questionData.text}`;
        document.getElementById('text_option_a').textContent = `Option 1: ${questionData.options[0]}`;
        document.getElementById('text_option_b').textContent = `Option 2: ${questionData.options[1]}`;
        document.getElementById('text_option_c').textContent = `Option 3: ${questionData.options[2]}`;
        document.getElementById('text_option_d').textContent = `Option 4: ${questionData.options[3]}`;
        document.getElementById('text_answer').textContent = `Correct answer: ${questionData.correctAnswer || 'Not Available'}`;
        document.getElementById('text-user').textContent = `Your Answer: ${questionData.userAnswer || 'Not Attempted'}`;
    }

    fetchQuestions();

    document.querySelector('.next').addEventListener('click', () => {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            alert("This is the last question.");
        }
    });

    document.querySelector('.previous').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        } else {
            alert("This is the first question.");
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