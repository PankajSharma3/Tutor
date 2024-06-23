let tabSwitchCount = 0;
let alertActive = false;

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        tabSwitchCount++;
        if (tabSwitchCount > 2) {
            submitTest();
        }
        if (!alertActive) {
            alertActive = true;
            setTimeout(() => {
                alert(`Tab switch count = ${tabSwitchCount}`);
                alertActive = false;
            }, 100);
        }
    }
});

// Disable right-click context menu
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// Disable keyboard shortcuts that might allow navigation away from the page
window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a' || e.key === 't')) {
        e.preventDefault();
    }
    if (e.key === 'F12' || e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault();
    }
});

function submitTest() {
    alert("Your test is submitted now");
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user._id : null;
    const test_name = localStorage.getItem('test');

    if (!userId || !test_name) {
        console.error('User ID or test name not found in local storage');
        return;
    }

    fetch('/api/submit-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, test_name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Test submitted successfully') {
            let keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key !== 'user') {
                localStorage.removeItem(key);
              }
            });
            window.location.href = "/thanks";
        } else {
            console.error('Error submitting test:', data);
        }
    })
    .catch(error => {
        console.error('Error submitting test:', error);
    });
}

function checkEndTime() {
    const endTime = localStorage.getItem('end_time');
   
    const endDateTime = new Date(`${localStorage.getItem('date')} ${endTime}`);
    const currentTime = new Date();

    if (currentTime > endDateTime) {
        submitTest();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testName: localStorage.getItem('test') })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(questions => {
        console.log('Fetched questions:', questions);
        localStorage.setItem('questions', JSON.stringify(questions));
        let currentQuestion = localStorage.getItem('currentQuestion') ? parseInt(localStorage.getItem('currentQuestion')) : 0;
        let answers = JSON.parse(localStorage.getItem('answers')) || [];
        const question = document.getElementById("quiz-question");
        const option_a = document.getElementById("text_option_a");
        const option_b = document.getElementById("text_option_b");
        const option_c = document.getElementById("text_option_c");
        const option_d = document.getElementById("text_option_d");
        const submit = document.querySelector(".submit");
        const next = document.querySelector(".next");
        const previous = document.querySelector(".previous");

        function loadQuestion() {
            const currentQuiz = questions[currentQuestion];
            question.textContent = (currentQuestion + 1) + ". " + currentQuiz.text;
            option_a.textContent = currentQuiz.options[0];
            option_b.textContent = currentQuiz.options[1];
            option_c.textContent = currentQuiz.options[2];
            option_d.textContent = currentQuiz.options[3];

            document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
            if (answers[currentQuestion]) {
                document.querySelectorAll('input[type="radio"]').forEach(input => {
                    if (input.nextElementSibling.textContent === answers[currentQuestion]) {
                        input.checked = true;
                    }
                });
            }
        }
        loadQuestion();

        submit.addEventListener("click", () => {
            const checkedAns = document.querySelector('input[type="radio"]:checked');
            if (checkedAns === null) {
                alert("Please select an answer");
            } else {
                const user = JSON.parse(localStorage.getItem('user'));
                const answer = checkedAns.nextElementSibling.textContent;
                const userId = user ? user._id : null;
                const test_name = localStorage.getItem('test');
                const username = user? user.username : null;

                if (!userId || !test_name) {
                    console.error('User ID or test name not found in local storage');
                    return;
                }

                fetch('/api/update-answer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, userId, questionIndex: currentQuestion, answer, test_name })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Answer updated successfully') {
                        answers[currentQuestion] = answer;
                        localStorage.setItem('answers', JSON.stringify(answers));
                        currentQuestion++;
                        if (currentQuestion < questions.length) {
                            loadQuestion();
                            localStorage.setItem('currentQuestion', currentQuestion);
                        } else {
                            if (confirm("You are on the last question. Do you want to submit the test?")) {
                                submitTest();
                            }
                        }
                    } else {
                        console.error('Error updating answer:', data);
                    }
                })
                .catch(error => {
                    console.error('Error updating answer:', error);
                });
            }
        });

        next.addEventListener("click", () => {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                loadQuestion();
                localStorage.setItem('currentQuestion', currentQuestion);
            } else {
                if (confirm("You are on the last question. Do you want to submit the test?")) {
                    submitTest();
                } else {
                    alert("This is the last question.");
                }
            }
        });

        previous.addEventListener("click", () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                loadQuestion();
                localStorage.setItem('currentQuestion', currentQuestion);
            } else {
                alert("This is the first question.");
            }
        });
    })
    .catch(error => {
        console.error('Error fetching questions:', error);
    });

    setInterval(checkEndTime, 1000);
});

function checkUserDetails() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = '/login';
    }
}

function checkSubmissionStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user._id : null;
    const test_name = localStorage.getItem('test');

    if (!userId || !test_name) {
        console.error('User ID or test name not found in local storage');
        return;
    }

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

checkUserDetails();
checkSubmissionStatus();
setInterval(checkSubmissionStatus, 1000);
